using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class CourseInfoEntity
    {
        //      public Int64 InstituteId { get; set; }
        //      public Int64 CourseID { get; set; }
        //      public string CourseCode { get; set; }
        //      public string Course { get; set; }
        //      public Int16 SectorID { get; set; }
        //      public string Sector { get; set; }
        //      public Int16 SubSectorID { get; set; }
        //      public string SubSector { get; set; }
        //      public Int16 CourseApproverID { get; set; }
        //      public string CourseApprover { get; set; }
        //      public Int16 CourseTypeID { get; set; }
        //      public string CourseType { get; set; }
        //      public int CourseTimingTypeId { get;set; }
        //      public string FullTimePartTime { get; set; }
        //      public Int32 Duration { get; set; }
        //      public Int32 DurationUnitId { get; set; }
        //      public string DurationUnit { get; set; }
        //public string DurationDisplay { get; set; }
        //public Int16 MinimumEntryQualificationID { get; set; }
        //      public string MinimumEntryQualification { get; set; }
        //      public Int16 MandatoryCriteriaAtEntryQualificationID { get; set; }
        //      public string MandatoryCriteriaAtEntryQualification { get; set; }
        //      public Int16 MinimumAge { get; set; }
        //      public Int16 NoOfUnit { get; set; }
        //      public Int16 IntakePerUnit { get; set; }
        //      public string NSQFLevel { get; set; }
        //      public Int16 TrainingFeeCategory { get; set; }

        //public string ModelCurriculumPath { get; set; }

        //public string QualificationPackPath { get; set; }
        //      public string CourseUrl { get; set; }

        //      public decimal WorkShopSpace { get; set; }
        //      public decimal PowerPerUnit { get; set; }
        //      public decimal AgricultureLand { get; set; }
        //      public decimal OpenGround { get; set; }
        //      public int MaxBatchPerDay { get; set; }
        //      public int FloorId { get; set; }
        //      public string FloorPref { get; set; }
        //      public bool IsSeparateClassRoomRequired { get; set; }
        //      public int ClassRoomUtilization { get; set; }
        //      public bool IsSeparateDrawingHallRequired { get; set; }
        //      public int DrawingHallUtilization { get; set; }
        //      public bool IsSeparateComputerLabRequired { get; set; }
        //      public int ComputerLabUtilization { get; set; }
        //      public bool IsEditAllowed { get; set; }
        //      public bool IsDeleteAllowed { get; set; }
        //      public string LastModifiedOn { get; set; }
        //public string UserLoginID { get; set; }
        //public string IPAddress { get; set; }
        //public string PageCode { get; set; }
        //public bool IsApproved { get; set; }

        public Int64 InstituteId { get; set; }
        public Int64 CourseID { get; set; }
        public string CourseCode { get; set; }
        public string Course { get; set; }
        public Int16 SectorID { get; set; }
        public string Sector { get; set; }
        public Int16 SubSectorID { get; set; }
        public string SubSector { get; set; }
        public Int16 CourseApproverID { get; set; }
        public string CourseApprover { get; set; }
        public Int16 CourseTypeID { get; set; }
        public string CourseType { get; set; }
        public int CourseTimingTypeId { get; set; }
        public string FullTimePartTime { get; set; }
        public Int32 Duration { get; set; }
        public Int32 DurationUnitId { get; set; }
        public string DurationUnit { get; set; }
        public string DurationDisplay { get; set; }
        public Int16 MinimumEntryQualificationID { get; set; }
        public string MinimumEntryQualification { get; set; }
        public Int16 MandatoryCriteriaAtEntryQualificationID { get; set; }
        public string MandatoryCriteriaAtEntryQualification { get; set; }
        public Int16 MinimumAge { get; set; }
        public Int16 NoOfUnit { get; set; }
        public Int16 IntakePerUnit { get; set; }
        public string NSQFLevel { get; set; }
        public Int16 TrainingFeeCategory { get; set; }

        public string ModelCurriculumPath { get; set; }

        public string QualificationPackPath { get; set; }
        public string CourseUrl { get; set; }

        public decimal WorkShopSpace { get; set; }
        public decimal PowerPerUnit { get; set; }
        public decimal AgricultureLand { get; set; }
        public decimal OpenGround { get; set; }
        public int MaxBatchPerDay { get; set; }
        public int FloorId { get; set; }
        public string FloorPref { get; set; }
        public bool IsSeparateClassRoomRequired { get; set; }
        public int ClassRoomUtilization { get; set; }
        public bool IsSeparateDrawingHallRequired { get; set; }
        public int DrawingHallUtilization { get; set; }
        public bool IsSeparateComputerLabRequired { get; set; }
        public int ComputerLabUtilization { get; set; }
        public bool IsEditAllowed { get; set; }
        public bool IsDeleteAllowed { get; set; }
        public string LastModifiedOn { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public bool IsApproved { get; set; }
        public string PerUnitSecurityDeposit { get; set; }
        public string PerUnitInspectionFees { get; set; }

        public int ApprovalGroupID { get; set; }
        public string CourseNameDisplay { get; set; }
    }
}
