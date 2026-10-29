using Portal.Business.Interface.MasterMgmt;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.MasterMgmt;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Business.Worker.MasterMgmt
{
    public class CoursDetailsWorker : ICourseDetails
    {
        private readonly Repository objData;

        // Inject Repository
        public CoursDetailsWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public string SaveCourse(NewCourseEntity courseEntity, string CreatedBy, string CreatedByIPAddress)
        {
            string retVal = "";

            try
            {
                retVal = objData.SaveCourse(courseEntity, CreatedBy, CreatedByIPAddress);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourse", courseEntity.CourseCode);
                retVal = ex.Message;
            }

            return retVal;
        }

        public NewCourseEntity GetCourseByID(Int64 CourseID)
        {
            NewCourseEntity obj = new NewCourseEntity();
            try
            {
                DataSet ds = objData.GetCourseByID(CourseID);

                if (ds.Tables != null && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                    obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                    obj.CourseName = Convert.ToString(dr["CourseName"]);
                    obj.CourseNameDisplay = Convert.ToString(dr["CourseNameDisplay"]);
                    obj.Sector = dr["Sector"] == DBNull.Value ? "" : Convert.ToString(dr["Sector"]);
                    obj.SectorID = dr["SectorID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["SectorID"]);
                    obj.SubSectorID = dr["SubSectorId"] == DBNull.Value ? -1 : Convert.ToInt32(dr["SubSectorId"]);
                    obj.SubSector = dr["SubSector"] == DBNull.Value ? "" : Convert.ToString(dr["SubSector"]);
                    obj.CourseApprovedBy = dr["CourseApprover"] == DBNull.Value ? "" : Convert.ToString(dr["CourseApprover"]);
                    obj.CourseCategoryID = dr["CourseCategoryID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["CourseCategoryID"]);
                    obj.CourseTypeID = dr["CourseTypeID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["CourseTypeID"]);
                    obj.TrainingModeConventional = dr["TrainingModeConventional"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingModeConventional"]);
                    obj.TrainingModeDualSystem = dr["TrainingModeDualSystem"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingModeDualSystem"]);
                    obj.TrainingModeBlended = dr["TrainingModeBlended"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingModeBlended"]);
                    obj.TrainingModeOnline = dr["TrainingModeOnline"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingModeOnline"]);
                    obj.TrainingModeAllMode = dr["TrainingModeAllMode"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingModeAllMode"]);
                    obj.CourseApprovedByID = dr["CourseApprovedByID"] == DBNull.Value ? -1 : Convert.ToInt16(dr["CourseApprovedByID"]);
                    obj.Duration = dr["Duration"] == DBNull.Value ? "" : Convert.ToString(dr["Duration"]);
                    obj.CourseDurationunit = dr["CourseDurationunit"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["CourseDurationunit"]);
                    obj.Hours = dr["Hours"] == DBNull.Value ? "" : Convert.ToString(dr["Hours"]);
                    obj.MaxBatchPerDay = dr["MaxBatchPerDay"] == DBNull.Value ? "" : Convert.ToString(dr["MaxBatchPerDay"]);
                    obj.NSQFLevelID = dr["NSQFLevelID"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["NSQFLevelID"]);
                    obj.TrainingFeeID = dr["TrainingFeeID"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["TrainingFeeID"]);
                    obj.MinAge = dr["MinAge"] == DBNull.Value ? -1 : Convert.ToInt32(dr["MinAge"]);
                    obj.IntakePerUnit = dr["IntakePerUnit"] == DBNull.Value ? -1 : Convert.ToInt32(dr["IntakePerUnit"]);
                    obj.BoardCoursesDuration = dr["BoardCoursesDuration"] == DBNull.Value ? -1 : Convert.ToInt32(dr["BoardCoursesDuration"]);
                    obj.BoardCoursesDurationUnitID = dr["BoardCoursesDurationUnitID"] == DBNull.Value ? Convert.ToInt16(0) : Convert.ToInt16(dr["BoardCoursesDurationUnitID"]);
                    obj.WorkshopFloorPreference = dr["WorkshopFloorPreference"] == DBNull.Value ? -1 : Convert.ToInt32(dr["WorkshopFloorPreference"]);
                    obj.WorkshopFloorPreferenceDisplay = dr["WorkshopFloorPreferenceDisplay"] == DBNull.Value ? "" : dr["WorkshopFloorPreferenceDisplay"].ToString();

                    obj.WorkshopSpaceRequired = dr["WorkshopSpaceRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["WorkshopSpaceRequired"]);
                    obj.PowerType = dr["PowerType"] == DBNull.Value ? -1 : Convert.ToInt32(dr["PowerType"]);
                    obj.PowerTypeDisplay = dr["PowerTypeDisplay"] == DBNull.Value ? "" : dr["PowerTypeDisplay"].ToString();
                    obj.PowerInKW = dr["PowerInKW"] == DBNull.Value ? 0 : Convert.ToInt32(dr["PowerInKW"]);
                    obj.SeparateClassRoomRequired = dr["SeparateClassRoomRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SeparateClassRoomRequired"]);
                    obj.ClassRoomArea = dr["ClassRoomArea"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ClassRoomArea"]);
                    obj.ClassUtilizationperweekinHours = dr["ClassUtilizationperweekinHours"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ClassUtilizationperweekinHours"]);
                    obj.SeparateDrawingHallRequired = dr["SeparateDrawingHallRequired"] == DBNull.Value ? -1 : Convert.ToInt32(dr["SeparateDrawingHallRequired"]);
                    obj.DrawingUtilizationperweekinHours = dr["DrawingUtilizationperweekinHours"] == DBNull.Value ? 0 : Convert.ToInt32(dr["DrawingUtilizationperweekinHours"]);
                    obj.DrawingRoomArea = dr["DrawingRoomArea"] == DBNull.Value ? 0 : Convert.ToInt32(dr["DrawingRoomArea"]);
                    obj.SeparateComputerLabRequired = dr["SeparateComputerLabRequired"] == DBNull.Value ? -1 : Convert.ToInt32(dr["SeparateComputerLabRequired"]);
                    obj.ComputerLabArea = dr["ComputerLabArea"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ComputerLabArea"]);
                    obj.ComputerLabUtilizationperweekinHours = dr["ComputerLabUtilizationperweekinHours"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ComputerLabUtilizationperweekinHours"]);
                    obj.SeparateAgricultureLandRequired = dr["SeparateAgricultureLandRequired"] == DBNull.Value ? -1 : Convert.ToInt32(dr["SeparateAgricultureLandRequired"]);
                    obj.AgricultureLandArea = dr["AgricultureLandArea"] == DBNull.Value ? 0 : Convert.ToInt32(dr["AgricultureLandArea"]);
                    obj.AgricultureLandUtilizationperweekinHours = dr["AgricultureLandUtilizationperweekinHours"] == DBNull.Value ? 0 : Convert.ToInt32(dr["AgricultureLandUtilizationperweekinHours"]);
                    obj.SeparateOpenGroundRequired = dr["SeparateOpenGroundRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SeparateOpenGroundRequired"]);
                    obj.OpenGroundArea = dr["OpenGroundArea"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OpenGroundArea"]);
                    obj.OpenGroundUtilizationperweekinHours = dr["OpenGroundUtilizationperweekinHours"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OpenGroundUtilizationperweekinHours"]);
                    obj.AdmissionFees = dr["AdmissionFees"] == DBNull.Value ? 0 : Convert.ToInt32(dr["AdmissionFees"]);
                    obj.InspectionFees = dr["InspectionFees"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionFees"]);
                    obj.SecurityDeposit = dr["SecurityDeposit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SecurityDeposit"]);
                    obj.RenewalFees = dr["RenewalFees"] == DBNull.Value ? 0 : Convert.ToInt32(dr["RenewalFees"]);
                    obj.SyllabusVersionDisplay = dr["SyllabusVersion"].ToString() == "" ? "" : CommonHelper.DateTimeToDateString(Convert.ToDateTime(dr["SyllabusVersion"].ToString()));
                    obj.ModelCurriculumUrl = dr["ModelCurriculumUrl"] == DBNull.Value ? "" : Convert.ToString(dr["ModelCurriculumUrl"]);
                    obj.QualificationPackUrl = dr["QualificationPackUrl"] == DBNull.Value ? "" : Convert.ToString(dr["QualificationPackUrl"]);
                    obj.CourseType = dr["CourseType"] == DBNull.Value ? "" : Convert.ToString(dr["CourseType"]);
                    obj.CourseCategory = dr["CourseCategory"] == DBNull.Value ? "" : Convert.ToString(dr["CourseCategory"]);
                    obj.NSQFLevel = dr["NSQFLevel"] == DBNull.Value ? "" : Convert.ToString(dr["NSQFLevel"]);
                    obj.TrainingMode = dr["TrainingMode"] == DBNull.Value ? "" : Convert.ToString(dr["TrainingMode"]);
                    obj.TrainingFeeCategory = dr["TrainingFeeCategory"] == DBNull.Value ? "" : Convert.ToString(dr["TrainingFeeCategory"]);


                    obj.TheoryBoardDuration = dr["TheoryBoardDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TheoryBoardDuration"]);
                    obj.TheoryBoardDurationunit = dr["TheoryBoardDurationunit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TheoryBoardDurationunit"]);
                    obj.OJTMandatoryBoardDuration = dr["OJTMandatoryBoardDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTMandatoryBoardDuration"]);
                    obj.OJTMandatoryBoardDurationunit = dr["OJTMandatoryBoardDurationunit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTMandatoryBoardDurationunit"]);
                    obj.OJTOptionalBoardDuration = dr["OJTOptionalBoardDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTOptionalBoardDuration"]);
                    obj.OJTOptionalBoardDurationunit = dr["OJTOptionalBoardDurationunit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTOptionalBoardDurationunit"]);
                    obj.PracticalBoardDuration = dr["PracticalBoardDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["PracticalBoardDuration"]);
                    obj.PracticalBoardDurationunit = dr["PracticalBoardDurationunit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["PracticalBoardDurationunit"]);
                    obj.TotalBoardDuration = dr["TotalBoardDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TotalBoardDuration"]);
                    obj.TotalBoardDurationunit = dr["TotalBoardDurationunit"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TotalBoardDurationunit"]);

                    obj.TheoryDuration = dr["TheoryDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TheoryDuration"]);
                    obj.PracticalDuration = dr["PracticalDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["PracticalDuration"]);
                    obj.OJTMandatoryDuration = dr["OJTMandatoryDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTMandatoryDuration"]);
                    obj.OJTOptionalDuration = dr["OJTOptionalDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["OJTOptionalDuration"]);
                    obj.TotalDuration = dr["TotalDuration"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TotalDuration"]);

                    obj.TheoryBoardDurationunitDisplay = dr["TheoryBoardDurationunitDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["TheoryBoardDurationunitDisplay"]);
                    obj.OJTMandatoryBoardDurationunitDisplay = dr["OJTMandatoryBoardDurationunitDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["OJTMandatoryBoardDurationunitDisplay"]);
                    obj.OJTOptionalBoardDurationunitDisplay = dr["OJTOptionalBoardDurationunitDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["OJTOptionalBoardDurationunitDisplay"]);
                    obj.PracticalBoardDurationunitDisplay = dr["PracticalBoardDurationunitDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["PracticalBoardDurationunitDisplay"]);
                    obj.TotalBoardDurationunitDisplay = dr["TotalBoardDurationunitDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["TotalBoardDurationunitDisplay"]);

                    obj.TheoryDurationDisplay = dr["TheoryDurationDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["TheoryDurationDisplay"]);
                    obj.PracticalDurationDisplay = dr["PracticalDurationDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["PracticalDurationDisplay"]);
                    obj.OJTMandatoryDurationDisplay = dr["OJTMandatoryDurationDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["OJTMandatoryDurationDisplay"]);
                    obj.OJTOptionalDurationDisplay = dr["OJTOptionalDurationDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["OJTOptionalDurationDisplay"]);
                    obj.TotalDurationDisplay = dr["TotalDurationDisplay"] == DBNull.Value ? "" : Convert.ToString(dr["TotalDurationDisplay"]);

                    obj.NewAdmission = dr["NewAdmission"] == DBNull.Value ? "" : Convert.ToString(dr["NewAdmission"]);
                    obj.DisplayonPortal = dr["DisplayonPortal"] == DBNull.Value ? "" : Convert.ToString(dr["DisplayonPortal"]);
                    obj.NewUnitApplication = dr["NewUnitApplication"] == DBNull.Value ? "" : Convert.ToString(dr["NewUnitApplication"]);

                }
                List<MinimumEntryQualificationEntity> lstMinQualification = new List<MinimumEntryQualificationEntity>();
                if (ds.Tables[1] != null && ds.Tables[1].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        MinimumEntryQualificationEntity objMinQualification = new MinimumEntryQualificationEntity();
                        objMinQualification.QualificationID = dr["QualificationID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["QualificationID"]);
                        objMinQualification.MandatoryCriteriaID = dr["MandatoryCriteriaID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["MandatoryCriteriaID"]);
                        objMinQualification.ExperienceInMonth = Convert.ToString(dr["ExperienceInMonth"]);
                        objMinQualification.Remark = Convert.ToString(dr["Remark"]);
                        objMinQualification.CourseID = dr["CourseID"] == DBNull.Value ? -1 : Convert.ToInt64(dr["CourseID"]);
                        objMinQualification.QualificationRowID = Convert.ToInt64(dr["ID"]);
                        objMinQualification.Qualification = dr["Qualification"] == DBNull.Value ? "" : Convert.ToString(dr["Qualification"]);
                        objMinQualification.MandatoryCriteria = dr["MandatoryCriteria"] == DBNull.Value ? "" : Convert.ToString(dr["MandatoryCriteria"]);
                        lstMinQualification.Add(objMinQualification);
                    }
                    obj.MinimumEntryQualificationEntity = lstMinQualification;
                }

                List<TraningInfrastructureEntity> lsttraningInfrastructures = new List<TraningInfrastructureEntity>();
                if (ds.Tables[2] != null && ds.Tables[2].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[2].Rows)
                    {
                        TraningInfrastructureEntity objTraningInfrastructureEntity = new TraningInfrastructureEntity();
                        objTraningInfrastructureEntity.CourseID = dr["CourseID"] == DBNull.Value ? -1 : Convert.ToInt64(dr["CourseID"]);
                        objTraningInfrastructureEntity.TraningInfrastructureRowID = dr["ID"] == DBNull.Value ? -1 : Convert.ToInt64(dr["ID"]);
                        objTraningInfrastructureEntity.NameofItemID = dr["NameofItemID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["NameofItemID"]);
                        objTraningInfrastructureEntity.CategoryID = dr["CategoryID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["CategoryID"]);
                        objTraningInfrastructureEntity.RemarkforUtilizationID = dr["RemarkforUtilizationID"] == DBNull.Value ? -1 : Convert.ToInt32(dr["RemarkforUtilizationID"]);
                        objTraningInfrastructureEntity.DSRItem = Convert.ToString(dr["DSRItem"]);
                        objTraningInfrastructureEntity.Mandatory = Convert.ToString(dr["Mandatory"]);
                        objTraningInfrastructureEntity.AlliedCourseItem = Convert.ToString(dr["AlliedCourseItem"]);
                        objTraningInfrastructureEntity.MoUItem = Convert.ToString(dr["MoUItem"]);
                        objTraningInfrastructureEntity.RequirePerunit = Convert.ToString(dr["RequirePerunit"]);
                        objTraningInfrastructureEntity.NameofItem = dr["NameofItem"] == DBNull.Value ? "" : Convert.ToString(dr["NameofItem"]);
                        objTraningInfrastructureEntity.RemarkforUtilization = dr["RemarkforUtilization"] == DBNull.Value ? "" : Convert.ToString(dr["RemarkforUtilization"]);
                        lsttraningInfrastructures.Add(objTraningInfrastructureEntity);
                    }
                    obj.trainingInfrastructureEntities = lsttraningInfrastructures;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateBank", obj.CourseName);
                throw ex;
            }
            return obj;
        }

        public DataTable GetTimeTableForEdit(long CourseID, int ExaminationID)
        {
            DataTable dt = new DataTable();

            try
            {
                dt = objData.GetTimeTableForEdit(CourseID, ExaminationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetTimeTableForEdit ExaminationID: " + ExaminationID + " CourseID: " + CourseID
                );

                throw;
            }

            return dt;
        }

        public string UpdateCourseDisplayAdmissionNewUnit(long CourseID, string UpdateCol, string Value)
        {
            string retVal = "";

            try
            {
                retVal = objData.UpdateCourseDisplayAdmissionNewUnit(CourseID, UpdateCol, Value);

                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "UpdateCourseDisplayAdmissionNewUnit",
                    CourseID.ToString()
                );

                retVal = ex.Message;
            }

            return retVal;
        }
    }
}