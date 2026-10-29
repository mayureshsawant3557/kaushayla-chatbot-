
using Azure;
using Microsoft.Exchange.WebServices.Data;
using Microsoft.Practices.EnterpriseLibrary.Data;
using Org.BouncyCastle.Crypto.Paddings;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Base;
using Portal.Entities.ElectionDuty;
using Portal.Entities.Institute;
using Portal.Entities.ITISpecification;
using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics.Eventing.Reader;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
using System.Reflection;
using System.Runtime.InteropServices.ComTypes;
using System.Security.Policy;
using System.Text;
using System.Threading.Tasks;
using static iTextSharp.text.pdf.events.IndexEvents;    


namespace Portal.Business.Worker.Institute
{
    public class InstituteBaseWorker : IInstituteBase
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public InstituteBaseWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public List<InstituteListEntity> SearchInstitute(InstituteSearchCriteriaEntity entity)
        {
            List<InstituteListEntity> objList = new List<InstituteListEntity>();
            try
            {
                DataSet ds = objData.SearchInstitute(entity);
                objList = ExtractInstituteList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitute");
                throw ex;
            }
            return objList;
        }
        public List<CourseInfoEntity> SearchCourseDetails(InstituteSearchCriteriaEntity entity)
        {
            List<CourseInfoEntity> objList = new List<CourseInfoEntity>();
            try
            {
                DataSet ds = objData.SearchCourseDetails(entity);
                objList = ExtractCourseList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitute");
                throw ex;
            }
            return objList;
        }
        public List<InstituteListEntity> SearchInstitutePublic(InstituteSearchCriteriaEntity entity)
        {
            List<InstituteListEntity> objList = new List<InstituteListEntity>();
            try
            {
                DataSet ds = objData.SearchInstitutePublic(entity);
                objList = ExtractInstituteList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitute");
                throw ex;
            }
            return objList;
        }
        public List<InstituteListEntity> ExtractInstituteList(DataSet ds)
        {
            List<InstituteListEntity> lst = new List<InstituteListEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        InstituteListEntity obj = new InstituteListEntity();

                        obj.InstituteID = Convert.ToInt64(dr["CollegeID"]);
                        obj.InstituteCode = Convert.ToString(dr["CollegeRegistrationNo"]);
                        obj.InstituteName = Convert.ToString(dr["CollegeName"]);
                        obj.RegionID = Convert.ToInt16(dr["RegionID"]);
                        obj.Region = Convert.ToString(dr["Region"]);
                        obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                        obj.District = Convert.ToString(dr["District"]);
                        obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                        obj.Taluka = Convert.ToString(dr["Taluka"]);
                        //obj.ChoiceCode = Convert.ToInt64(dr["ChoiceCode"]);
                        if (!(dr["CourseID"] is DBNull))
                            obj.CourseID = Convert.ToInt32(dr["CourseID"]);
                        if (!(dr["CourseCode"] is DBNull))
                            obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                        if (!(dr["CourseName"] is DBNull))
                            obj.Course = Convert.ToString(dr["CourseName"]);
                        if (!(dr["ShiftID"] is DBNull))
                            obj.ShiftID = Convert.ToInt16(dr["ShiftID"]);
                        if (!(dr["Shift"] is DBNull))
                            obj.Shift = Convert.ToString(dr["Shift"]);
                        if (!(dr["SectorID"] is DBNull))
                            obj.SectorID = Convert.ToInt16(dr["SectorID"]);
                        if (!(dr["Sector"] is DBNull))
                            obj.Sector = Convert.ToString(dr["Sector"]);
                        if (!(dr["CourseTypeID"] is DBNull))
                            obj.CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]);
                        if (!(dr["CourseType"] is DBNull))
                            obj.CourseType = Convert.ToString(dr["CourseType"]);
                        if (!(dr["EntryQualificationID"] is DBNull))
                            obj.EntryQualificationID = Convert.ToInt16(dr["EntryQualificationID"]);
                        if (!(dr["EntryQualification"] is DBNull))
                            obj.EntryQualification = Convert.ToString(dr["EntryQualification"]);
                        if (!(dr["AffiliationValidity"] is DBNull))
                            obj.AffiliationValidity = Convert.ToString(dr["AffiliationValidity"]);
                        if (!(dr["NoOfUnit"] is DBNull))
                            obj.NoOfUnit = Convert.ToInt16(dr["NoOfUnit"]);
                        if (!(dr["TotalIntake"] is DBNull))
                            obj.TotalIntake = Convert.ToInt16(dr["TotalIntake"]);
                        if (!(dr["CurrentVacancy"] is DBNull))
                            obj.CurrentVacancy = Convert.ToInt16(dr["CurrentVacancy"]);
                        if (!(dr["FullTimePartTime"] is DBNull))
                            obj.FullTimePartTime = Convert.ToString(dr["FullTimePartTime"]);
                        if (!(dr["InstituteUrl"] is DBNull))
                            obj.InstituteUrl = Convert.ToString(dr["InstituteUrl"]);


                        lst.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return lst;
        }
        public List<CourseInfoEntity> ExtractCourseList(DataSet ds)
        {
            List<CourseInfoEntity> lst = new List<CourseInfoEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        CourseInfoEntity obj = new CourseInfoEntity();


                        //obj.ChoiceCode = Convert.ToInt64(dr["ChoiceCode"]);
                        if (!(dr["CourseID"] is DBNull))
                            obj.CourseID = Convert.ToInt32(dr["CourseID"]);
                        if (!(dr["CourseCode"] is DBNull))
                            obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                        if (!(dr["CourseName"] is DBNull))
                            obj.Course = Convert.ToString(dr["CourseName"]);

                        if (!(dr["SectorID"] is DBNull))
                            obj.SectorID = Convert.ToInt16(dr["SectorID"]);
                        if (!(dr["Sector"] is DBNull))
                            obj.Sector = Convert.ToString(dr["Sector"]);
                        if (!(dr["SubSectorID"] is DBNull))
                            obj.SubSectorID = Convert.ToInt16(dr["SubSectorID"]);
                        if (!(dr["SubSector"] is DBNull))
                            obj.SubSector = Convert.ToString(dr["SubSector"]);
                        if (!(dr["CourseApproverID"] is DBNull))
                            obj.CourseApproverID = Convert.ToInt16(dr["CourseApproverID"]);
                        if (!(dr["CourseApprover"] is DBNull))
                            obj.CourseApprover = Convert.ToString(dr["CourseApprover"]);
                        if (!(dr["CourseTypeID"] is DBNull))
                            obj.CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]);
                        if (!(dr["CourseType"] is DBNull))
                            obj.CourseType = Convert.ToString(dr["CourseType"]);


                        if (!(dr["FullTimePartTime"] is DBNull))
                            obj.FullTimePartTime = Convert.ToString(dr["FullTimePartTime"]);
                        if (!(dr["Duration"] is DBNull))
                            obj.Duration = Convert.ToInt16(dr["Duration"]);
                        if (!(dr["DurationUnit"] is DBNull))
                            obj.DurationUnit = Convert.ToString(dr["DurationUnit"]);
                        if (!(dr["MinimumEntryQualificationID"] is DBNull))
                            obj.MinimumEntryQualificationID = Convert.ToInt16(dr["MinimumEntryQualificationID"]);
                        if (!(dr["MinimumEntryQualification"] is DBNull))
                            obj.MinimumEntryQualification = Convert.ToString(dr["MinimumEntryQualification"]);
                        if (!(dr["MandatoryCriteriaAtEntryQualificationID"] is DBNull))
                            obj.MandatoryCriteriaAtEntryQualificationID = Convert.ToInt16(dr["MandatoryCriteriaAtEntryQualificationID"]);
                        if (!(dr["MandatoryCriteriaAtEntryQualification"] is DBNull))
                            obj.MandatoryCriteriaAtEntryQualification = Convert.ToString(dr["MandatoryCriteriaAtEntryQualification"]);
                        if (!(dr["MinimumAge"] is DBNull))
                            obj.MinimumAge = Convert.ToInt16(dr["MinimumAge"]);
                        if (!(dr["IntakePerUnit"] is DBNull))
                            obj.IntakePerUnit = Convert.ToInt16(dr["IntakePerUnit"]);
                        if (!(dr["NSQFLevel"] is DBNull))
                            obj.NSQFLevel = Convert.ToString(dr["NSQFLevel"]);
                        if (!(dr["TrainingFeeCategory"] is DBNull))
                            obj.TrainingFeeCategory = Convert.ToInt16(dr["TrainingFeeCategory"]);
                        if (!(dr["ModelCurriculumPath"] is DBNull))
                            obj.ModelCurriculumPath = Convert.ToString(dr["ModelCurriculumPath"]);
                        if (!(dr["QualificationPackPath"] is DBNull))
                            obj.QualificationPackPath = Convert.ToString(dr["QualificationPackPath"]);
                        if (!(dr["CourseUrl"] is DBNull))
                            obj.CourseUrl = Convert.ToString(dr["CourseUrl"]);
                        if (!(dr["DurationDisplay"] is DBNull))
                            obj.DurationDisplay = Convert.ToString(dr["DurationDisplay"]);
                        lst.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return lst;
        }
        public InstituteInfoEntity GetInstituteDetails(long InstituteID, long CourseID)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            try
            {
                DataSet ds = objData.GetInstituteDetails(InstituteID, CourseID);
                obj = ExtractInstituteDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDetails");
                throw ex;
            }
            return obj;
        }









        public InstituteInfoEntity ExtractInstituteDetails(DataSet ds)
        {
            InstituteInfoEntity obj = new InstituteInfoEntity();
            List<InstituteMemberEntity> listMember = new List<InstituteMemberEntity>();
            List<InstituteCourseEntity> listCourse = new List<InstituteCourseEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                    obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
                    obj.InstituteName = Convert.ToString(dr["InstituteName"]);
                    obj.InstituteAddress = Convert.ToString(dr["InstituteAddress"]);
                    obj.StateID = Convert.ToInt16(dr["StateID"]);
                    obj.State = Convert.ToString(dr["State"]);
                    obj.RegionID = Convert.ToInt16(dr["RegionID"]);
                    obj.Region = Convert.ToString(dr["Region"]);
                    obj.DistrictID = Convert.ToInt32(dr["DistrictID"]);
                    obj.District = Convert.ToString(dr["District"]);
                    obj.TalukaID = Convert.ToInt32(dr["TalukaID"]);
                    obj.Taluka = Convert.ToString(dr["Taluka"]);
                    obj.City = Convert.ToString(dr["City"]);
                    obj.PinCode = Convert.ToString(dr["PinCode"]);
                    obj.PhoneNo = Convert.ToString(dr["PhoneNo"]);
                    obj.FaxNo = Convert.ToString(dr["FaxNo"]);
                    obj.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.WebSite = Convert.ToString(dr["WebSite"]);
                    obj.LastModifiedOn = Convert.ToString(dr["LastModifiedOn"]);
                    obj.AuthorizedPersonTitle = Convert.ToString(dr["AuthorizedPersonTitle"]);
                    obj.AuthorizedPersonFirstName = Convert.ToString(dr["AuthorizedPersonFirstName"]);
                    obj.AuthorizedPersonFirstName = Convert.ToString(dr["AuthorizedPersonFirstName"]);
                    obj.AuthorizedPersonLastName = Convert.ToString(dr["AuthorizedPersonLastName"]);
                    obj.AuthorizedPersonName = Convert.ToString(dr["AuthorizedPersonName"]);
                    obj.AuthorizedPersonMobileNo1 = Convert.ToString(dr["AuthorizedPersonMobileNo1"]);
                    obj.AuthorizedPersonMobileNo2 = Convert.ToString(dr["AuthorizedPersonMobileNo2"]);
                    obj.AuthorizedPersonEmailId = Convert.ToString(dr["AuthorizedPersonEmailId"]);
                    obj.Designation = Convert.ToString(dr["Designation"]);


                    if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                    {
                        foreach (DataRow dr1 in ds.Tables[1].Rows)
                        {
                            InstituteMemberEntity objMember = new InstituteMemberEntity();

                            objMember.MemberTypeID = Convert.ToInt16(dr1["MemberTypeID"]);
                            objMember.MemberType = Convert.ToString(dr1["MemberType"]);
                            objMember.MemberName = Convert.ToString(dr1["MemberName"]);
                            objMember.Designation = Convert.ToString(dr1["Designation"]);
                            objMember.MobileNo = Convert.ToString(dr1["MobileNo"]);
                            objMember.AltMobileNo = Convert.ToString(dr1["AltMobileNo"]);
                            objMember.EMailiD = Convert.ToString(dr1["EMailiD"]);
                            objMember.PhoneNo = Convert.ToString(dr1["PhoneNo"]);

                            listMember.Add(objMember);
                        }
                    }
                    obj.ListInstituteMember = listMember;

                    if (ds.Tables.Count > 2 && ds.Tables[2].Rows.Count > 0)
                    {
                        InstituteCourseEntity objCourse;
                        foreach (DataRow dr1 in ds.Tables[2].Rows)
                        {
                            objCourse = new InstituteCourseEntity();

                            //objCourse.ChoiceCode = Convert.ToInt64(dr1["ChoiceCode"]);
                            objCourse.CourseID = Convert.ToInt64(dr1["CourseID"]);
                            objCourse.CourseCode = Convert.ToString(dr1["CourseCode"]);
                            objCourse.Course = Convert.ToString(dr1["Course"]);
                            objCourse.ShiftID = Convert.ToInt16(dr1["ShiftID"]);
                            objCourse.Shift = Convert.ToString(dr1["Shift"]);
                            objCourse.CourseTypeID = Convert.ToInt16(dr1["CourseTypeID"]);
                            objCourse.CourseType = Convert.ToString(dr1["CourseType"]);
                            objCourse.CourseBatchStartDate = Convert.ToString(dr1["CourseBatchStartDate"]);
                            objCourse.AdmissionLastDate = Convert.ToString(dr1["AdmissionLastDate"]);
                            objCourse.TotalIntake = Convert.ToInt16(dr1["TotalIntake"]);
                            objCourse.CurrentVacancy = Convert.ToInt16(dr1["CurrentVacancy"]);
                            objCourse.FullTimePartTime = Convert.ToString(dr1["FullTimePartTime"]);
                            objCourse.Duration = Convert.ToString(dr1["Duration"]);
                            listCourse.Add(objCourse);
                        }
                    }
                    obj.ListInstituteCourse = listCourse;
                }
            }
            catch (Exception)
            {
                throw;
            }
            return obj;
        }
        //public CourseInfoEntity GetCourseDetails(long CourseID)
        //{
        //    CourseInfoEntity obj = new CourseInfoEntity();
        //    try
        //    {
        //        DataSet ds = objData.GetCourseDetails(CourseID);

        //        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //        {
        //            DataRow dr = ds.Tables[0].Rows[0];

        //            obj.CourseID = Convert.ToInt64(dr["CourseID"]);
        //            obj.CourseCode = Convert.ToString(dr["CourseCode"]);
        //            obj.Course = Convert.ToString(dr["CourseName"]);
        //            obj.SectorID = Convert.ToInt16(dr["SectorID"]);
        //            obj.Sector = Convert.ToString(dr["Sector"]);
        //            obj.SubSectorID = Convert.ToInt16(dr["SubSectorID"]);
        //            obj.SubSector = Convert.ToString(dr["SubSector"]);
        //            obj.CourseApproverID = Convert.ToInt16(dr["CourseApproverID"]);
        //            obj.CourseApprover = Convert.ToString(dr["CourseApprover"]);
        //            obj.CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]);
        //            obj.CourseType = Convert.ToString(dr["CourseType"]);
        //            obj.FullTimePartTime = Convert.ToString(dr["FullTimePartTime"]);
        //            obj.Duration = Convert.ToInt16(dr["Duration"]);
        //            obj.DurationUnit = Convert.ToString(dr["DurationUnit"]);
        //            obj.MinimumEntryQualificationID = Convert.ToInt16(dr["MinimumEntryQualificationID"]);
        //            obj.MinimumEntryQualification = Convert.ToString(dr["MinimumEntryQualification"]);
        //            obj.MandatoryCriteriaAtEntryQualificationID = Convert.ToInt16(dr["MandatoryCriteriaAtEntryQualificationID"]);
        //            obj.MandatoryCriteriaAtEntryQualification = Convert.ToString(dr["MandatoryCriteriaAtEntryQualification"]);
        //            obj.MinimumAge = Convert.ToInt16(dr["MinimumAge"]);
        //            obj.IntakePerUnit = Convert.ToInt16(dr["IntakePerUnit"]);
        //            obj.NSQFLevel = Convert.ToString(dr["NSQFLevel"]);
        //            obj.TrainingFeeCategory = Convert.ToInt16(dr["TrainingFeeCategory"]);
        //            obj.LastModifiedOn = Convert.ToString(dr["LastModifiedOn"]);
        //            obj.ModelCurriculumPath = Convert.ToString(dr["ModelCurriculumPath"]);
        //            obj.QualificationPackPath = Convert.ToString(dr["QualificationPackPath"]);
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetCourseDetails");
        //        throw ex;
        //    }
        //    return obj;
        //}

        public CourseInfoEntity GetCourseDetails(long CourseID)
        {
            CourseInfoEntity obj = new CourseInfoEntity();
            try
            {
                DataSet ds = objData.GetCourseDetails(CourseID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                    obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                    obj.Course = Convert.ToString(dr["CourseName"]);
                    obj.SectorID = Convert.ToInt16(dr["SectorID"]);
                    obj.Sector = Convert.ToString(dr["Sector"]);
                    obj.SubSectorID = Convert.ToInt16(dr["SubSectorID"]);
                    obj.SubSector = Convert.ToString(dr["SubSector"]);
                    obj.CourseApproverID = Convert.ToInt16(dr["CourseApproverID"]);
                    obj.CourseApprover = Convert.ToString(dr["CourseApprover"]);
                    obj.CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]);
                    obj.CourseType = Convert.ToString(dr["CourseType"]);
                    obj.FullTimePartTime = Convert.ToString(dr["FullTimePartTime"]);
                    obj.Duration = Convert.ToInt16(dr["Duration"]);
                    obj.DurationUnit = Convert.ToString(dr["DurationUnit"]);
                    obj.MinimumEntryQualificationID = Convert.ToInt16(dr["MinimumEntryQualificationID"]);
                    obj.MinimumEntryQualification = Convert.ToString(dr["MinimumEntryQualification"]);
                    obj.MandatoryCriteriaAtEntryQualificationID = Convert.ToInt16(dr["MandatoryCriteriaAtEntryQualificationID"]);
                    obj.MandatoryCriteriaAtEntryQualification = Convert.ToString(dr["MandatoryCriteriaAtEntryQualification"]);
                    obj.MinimumAge = Convert.ToInt16(dr["MinimumAge"]);
                    obj.IntakePerUnit = Convert.ToInt16(dr["IntakePerUnit"]);
                    obj.NSQFLevel = Convert.ToString(dr["NSQFLevel"]);
                    obj.TrainingFeeCategory = Convert.ToInt16(dr["TrainingFeeCategory"]);
                    obj.LastModifiedOn = Convert.ToString(dr["LastModifiedOn"]);
                    obj.ModelCurriculumPath = Convert.ToString(dr["ModelCurriculumPath"]);
                    obj.QualificationPackPath = Convert.ToString(dr["QualificationPackPath"]);
                    obj.PerUnitSecurityDeposit = Convert.ToString(dr["PerUnitSecurityDeposit"]);
                    obj.PerUnitInspectionFees = Convert.ToString(dr["PerUnitInspectionFees"]);
                    obj.ApprovalGroupID = Convert.ToInt16(dr["ApprovalGroupID"]);
                    obj.CourseNameDisplay = Convert.ToString(dr["CourseNameDisplay"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseDetails");
                throw ex;
            }
            return obj;
        }


        public string SaveProposedInstituteDetails(ProposedInstituteInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveProposedInstituteDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedInstituteDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveCollegeDetails(InstituteInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveCollegeDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCollegeDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveCourseDetails(CourseInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveCourseDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveProposedCourseDetails(CourseInfoEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveProposedCourseDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveCourseUnitDetails(CourseDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveCourseUnitDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseUnitDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataSet GetCourseUnitDetails(long InstituteID, long CourseID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCourseUnitDetails(InstituteID, CourseID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseUnitDetails");
                throw ex;
            }
            return ds;
        }
        public CourseDetailsEntity GetCourseUnitDetailsByShiftUnit(long InstituteID, long CourseID, int ShiftID, int UnitNo)
        {
            CourseDetailsEntity obj = new CourseDetailsEntity();
            try
            {
                DataSet ds = objData.GetCourseUnitDetailsByShiftUnit(InstituteID, CourseID, ShiftID, UnitNo);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow dr = ds.Tables[0].Rows[0];

                    obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                    obj.InstituteID = Convert.ToInt64(dr["CollegeID"]);
                    obj.InstituteCode = Convert.ToString(dr["CollegeRegistrationNo"]);
                    obj.InstituteName = Convert.ToString(dr["CollegeName"]);
                    obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                    obj.PartFullTime = Convert.ToString(dr["BatchSchedue"]);
                    obj.UnitCode = Convert.ToString(dr["UnitCode"]);
                    obj.ShiftID = Convert.ToInt16(dr["ShiftId"]);
                    obj.UnitNo = Convert.ToInt16(dr["UnitNo"]);
                    obj.Intake = Convert.ToInt16(dr["Intake"]);
                    obj.IsActive = Convert.ToBoolean(dr["IsActive"]);
                    obj.AdmissionSessionID = Convert.ToInt16(dr["AdmissionSessionID"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseUnitDetailsByShiftUnit" + "InstituteID:" + InstituteID.ToString() + " CourseID:" + CourseID.ToString());
                throw ex;
            }
            return obj;
        }
        public string DeleteCourseUnitDetails(long InstituteID, long CourseID, int ShiftID, int UnitNo, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteCourseUnitDetails(InstituteID, CourseID, ShiftID, UnitNo, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCourseUnitDetails", UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataSet GETBatchDetailsByCollege(long InstituteID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GETBatchDetailsByCollege(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GETBatchDetailsByCollege" + InstituteID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataSet GetUnitByInstitute(long InstituteID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetUnitByInstitute(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUnitByInstitute" + InstituteID.ToString());
                throw ex;
            }
            return ds;
        }

        public DataSet GETBatchDetails(long InstituteID, long CourseID, int ShiftID, int UnitNo)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GETBatchDetails(InstituteID, CourseID, ShiftID, UnitNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GETBatchDetails InstituteID: " + InstituteID + " CourseID" + CourseID);
                throw ex;
            }
            return ds;
        }

        public DataTable GetNewBatchDetails(long InstituteID, long CourseID, int ShiftID, int UnitNo)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.GetNewBatchDetails(InstituteID, CourseID, ShiftID, UnitNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetNewBatchDetails InstituteID: " + InstituteID + " CourseID" + CourseID);
                throw ex;
            }
            return ds;

        }
        public string SaveBatchDetails(BatchDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveBatchDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveBatchDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GETBatchDetailsByBatchID(long BatchID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GETBatchDetailsByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GETBatchDetails BatchID: " + BatchID);
                throw ex;
            }
            return dt;
        }
        public string DeleteBatchDetailsByBatchID(long BatchID)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteBatchDetailsByBatchID(BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteBatchDetailsByBatchID", BatchID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string UpdateBatchDetails(BatchDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateBatchDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateBatchDetails", entity.BatchID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }


        //Proposed Course of new INstitute

        public List<ProposedCourseUnitDetailsEntity> GetProposedCourseUnitRequirementDetails(long InstituteID, long CourseId, string UserLoginID)
        {
            DataSet ds = null;
            List<ProposedCourseUnitDetailsEntity> lst = new List<ProposedCourseUnitDetailsEntity>();
            ProposedCourseUnitDetailsEntity obj = null;
            try
            {
                ds = objData.GetProposedCourseUnitRequirementDetails(InstituteID, CourseId, UserLoginID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new ProposedCourseUnitDetailsEntity();
                        obj.RequiredItems = dr["RequiredItems"].ToString();
                        obj.PerUnitNorms = dr["PerUnitNorms"].ToString();
                        obj.RequiredForApprovedUnits = Convert.ToString(dr["ApprovedUnits"]);
                        obj.RequiredForProposedUnits = Convert.ToString(dr["ProposedUnits"]);
                        obj.RequiredForTotalUnits = Convert.ToString(dr["TotalUnits"]);

                        lst.Add(obj);
                    }
                }

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitRequirementDetails", InstituteID.ToString());

            }
            return lst;
        }

        public DataSet GetCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetCourseUnitDetailsForApprovalByCoureseID(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseDetails", entity.InstituteId.ToString());

            }
            return ds;
        }
        public DataSet GetProposedCourseUnitDetails(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetProposedCourseUnitDetails(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseDetails", entity.InstituteId.ToString());

            }
            return ds;
        }
        public string SaveProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveProposedCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }

        public string DeleteProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteProposedCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }

        //Builiding 

        public List<BuildingDetailsEntity> GetBuildingDetails(long InstituteID, long BuildingId = 0)
        {
            List<BuildingDetailsEntity> ls = new List<BuildingDetailsEntity>();
            try
            {
                DataSet ds = objData.GetBuildingDetails(InstituteID, BuildingId);
                ls = ExtractBuildingDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBuildingDetails");
                throw ex;
            }
            return ls;
        }
        public List<BuildingDetailsEntity> ExtractBuildingDetails(DataSet ds)
        {
            BuildingDetailsEntity obj = new BuildingDetailsEntity();
            List<BuildingDetailsEntity> ls = new List<BuildingDetailsEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    //DataRow dr = ds.Tables[0].Rows[0];
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new BuildingDetailsEntity();
                        obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                        obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
                        obj.BuildingID = Convert.ToInt64(dr["BuildingID"]);

                        obj.BuildingNameTypeId = Convert.ToInt32(dr["BuildingNameTypeId"]);
                        obj.BuildingNameType = Convert.ToString(dr["BuildingNameType"]);
                        obj.OwnerShipTypeid = Convert.ToInt32(dr["OwnerShipTypeid"]);
                        obj.OwnerShipType = Convert.ToString(dr["OwnerShipType"]);
                        obj.BuildingStatusId = Convert.ToInt32(dr["BuildingStatusId"]);
                        obj.BuildingOtherUsestatusId = Convert.ToInt32(dr["BuildingOtherUsestatusId"]);
                        obj.BuildingStatus = Convert.ToString(dr["BuildingStatus"]);
                        obj.BuildingOtherUsestatus = dr["BuildingOtherUsestatus"] == DBNull.Value ? "" : dr["BuildingOtherUsestatus"].ToString();



                        obj.BuildingOtherUsestatusText = dr["BuildingOtherUsestatusText"] == DBNull.Value ? "" : dr["BuildingOtherUsestatusText"].ToString();



                        obj.ConstructionTypeId = Convert.ToInt32(dr["ConstructionTypeId"]);
                        obj.ConstructionType = Convert.ToString(dr["ConstructionType"]);
                        obj.UsageTypeId = Convert.ToInt32(dr["UsageTypeId"]);
                        obj.UsageType = Convert.ToString(dr["UsageType"]);
                        obj.FloorId = Convert.ToInt32(dr["FloorId"]);
                        obj.FloorName = Convert.ToString(dr["FloorName"]);
                        obj.ConstructionYear = Convert.ToString(dr["ConstructionYear"]);

                        obj.GroundFloorArea = Convert.ToDecimal(dr["GroundFloorArea"]);
                        obj.OtherFloorArea = Convert.ToDecimal(dr["OtherFloorArea"]);
                        obj.TotalFloorArea = Convert.ToDecimal(dr["TotalFloorArea"]);
                        obj.CelingHeight = Convert.ToDecimal(dr["CelingHeight"]);
                        obj.RoadWidth = Convert.ToDecimal(dr["RoadWidth"]);


                        obj.ConstructionYearId = Convert.ToInt32(dr["ConstructionYearId"]);
                        obj.LeaseDate = Convert.ToString(dr["LeaseDate"]);
                        obj.LeaseExpiryDate = Convert.ToString(dr["LeaseExpiryDate"]);
                        obj.Building712FilePath = Convert.ToString(dr["Land712FilePath"]);
                        obj.LeaseFilePath = Convert.ToString(dr["LeaseFilePath"]);
                        obj.FloorPlanFilePath = Convert.ToString(dr["FloorPlanFilePath"]);
                        obj.GoogleMapPath = Convert.ToString(dr["GoogleMapPath"]);
                        obj.BuildingPhotoPath = Convert.ToString(dr["BuildingPhotoPath"]);
                        obj.RoadDocPath = Convert.ToString(dr["RoadDocPath"]);
                        obj.Latitude = Convert.ToDecimal(dr["Latitude"]);
                        obj.Longitude = Convert.ToDecimal(dr["Longitude"]);

                        obj.IsDedicated = Convert.ToBoolean(dr["IsDedicated"]);
                        obj.HasApproachRoad = Convert.ToBoolean(dr["HasApproachRoad"]);

                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);

                        ls.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return ls;
        }
        public string SaveBuildingDetails(BuildingDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveBuildingDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveBuildingDetails");
                throw ex;
            }
            return returnval;
        }

        public string DeleteBuildingDetails(long InstituteID, long BuildingId, string UserLoginID, string IPAddress)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteBuildingDetails(InstituteID, BuildingId, UserLoginID, IPAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteBuildingDetails");
                throw ex;
            }
            return returnval;
        }


        public List<BuildingSpaceNormsEntity> GetBuildingSpaceasperNorms(long instituteID)
        {
            List<BuildingSpaceNormsEntity> result = new List<BuildingSpaceNormsEntity>();

            try
            {
                DataSet ds = objData.GetBuildingSpaceasperNorms(instituteID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    BuildingSpaceNormsEntity entity = null;

                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        entity = new BuildingSpaceNormsEntity();

                        entity.CourseID = dr["CourseID"] == DBNull.Value ? 0 : Convert.ToInt64(dr["CourseID"]);
                        entity.InstituteID = dr["InstituteID"] == DBNull.Value ? 0 : Convert.ToInt64(dr["InstituteID"]);
                        entity.CourseNameCode = dr["CourseNameCode"] == DBNull.Value ? string.Empty : Convert.ToString(dr["CourseNameCode"]);

                        entity.InspectionUnits = dr["InspectionUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionUnits"]);
                        entity.MaxTraningSetupRequired = dr["MaxTraningSetupRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["MaxTraningSetupRequired"]);
                        entity.ApprovedUnits = dr["ApprovedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ApprovedUnits"]);
                        entity.LOIProposedUnits = dr["LOIProposedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["LOIProposedUnits"]);
                        entity.LOITotalUnits = dr["LOITotalUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["LOITotalUnits"]);

                        entity.PerUnitNorms = dr["PerUnitNorms"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["PerUnitNorms"]);
                        entity.FloorPreference = dr["FloorPreference"] == DBNull.Value ? 0 : Convert.ToInt32(dr["FloorPreference"]);

                        entity.AreaOnGroundFloor = dr["AreaOnGroundFloor"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["AreaOnGroundFloor"]);
                        entity.AreaonOtherthanGroundFloor = dr["AreaonOtherthanGroundFloor"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["AreaonOtherthanGroundFloor"]);
                        entity.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? "" : dr["ModelCurriculum"].ToString();


                        result.Add(entity);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBuildingSpaceasperNorms");
                throw;
            }

            return result;
        }


        public List<BuildingSpaceAnalysisEntity> GetBuildingSpaceasperNormsAnalysis(long instituteID)
        {
            List<BuildingSpaceAnalysisEntity> result = new List<BuildingSpaceAnalysisEntity>();

            try
            {
                DataSet ds = objData.GetBuildingSpaceasperNormsAnalysis(instituteID);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    BuildingSpaceAnalysisEntity entity = null;

                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        entity = new BuildingSpaceAnalysisEntity();

                        entity.Title = dr["Title"] == DBNull.Value ? string.Empty : Convert.ToString(dr["Title"]);
                        entity.GroundFloorArea = dr["GroundFloorArea"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["GroundFloorArea"]);
                        entity.OtherFloorArea = dr["OtherFloorArea"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["OtherFloorArea"]);
                        entity.TotalFloorArea = dr["TotalFloorArea"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["TotalFloorArea"]);
                        entity.Remark = dr["Remark"] == DBNull.Value ? string.Empty : Convert.ToString(dr["Remark"]);


                        result.Add(entity);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBuildingSpaceasperNormsAnalysis");
                throw;
            }

            return result;
        }


        // Land

        public List<RequiredLandDetailsEntity> GetRequiredLandDetails(long InstituteID, string userloginId)
        {
            List<RequiredLandDetailsEntity> ls = new List<RequiredLandDetailsEntity>();
            try
            {
                DataSet ds = objData.GetRequiredLandDetails(InstituteID, userloginId);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    RequiredLandDetailsEntity lo = null;
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        lo = new RequiredLandDetailsEntity();

                        lo.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());
                        lo.InstituteCode = Convert.ToString(dr["InstituteCode"].ToString());
                        lo.CourseCode = Convert.ToString(dr["CourseCode"].ToString());
                        lo.Course = Convert.ToString(dr["Course"].ToString());
                        lo.CourseCode_Course = Convert.ToString(dr["CourseCode_Course"].ToString());
                        lo.ProposedUnits = Convert.ToInt32(dr["ProposedUnits"].ToString());
                        lo.TotalUnits = Convert.ToInt32(dr["TotalUnits"].ToString());
                        lo.ApprovedUnits = Convert.ToInt32(dr["ApprovedUnits"].ToString());
                        lo.AgricultureLandArea = Convert.ToDecimal(dr["AgricultureLandArea"].ToString());
                        lo.OpenGroundArea = Convert.ToDecimal(dr["OpenGroundArea"].ToString());
                        lo.InspectionUnits = Convert.ToDecimal(dr["InspectionUnits"].ToString());
                        lo.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? "" : dr["ModelCurriculum"].ToString();

                        ls.Add(lo);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLandDetails");
                throw ex;
            }
            return ls;
        }
        public List<LandDetailsEntity> GetLandDetails(long InstituteID, long LandId = 0)
        {
            List<LandDetailsEntity> ls = new List<LandDetailsEntity>();
            try
            {
                DataSet ds = objData.GetLandDetails(InstituteID, LandId);
                ls = ExtractLandDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLandDetails");
                throw ex;
            }
            return ls;
        }
        public List<LandDetailsEntity> ExtractLandDetails(DataSet ds)
        {
            LandDetailsEntity obj = new LandDetailsEntity();
            List<LandDetailsEntity> ls = new List<LandDetailsEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    //DataRow dr = ds.Tables[0].Rows[0];
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new LandDetailsEntity();
                        obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                        obj.InstituteCode = Convert.ToString(dr["InstituteCode"]);
                        obj.LandID = Convert.ToInt64(dr["LandID"]);

                        obj.OwnerShipTypeid = Convert.ToInt32(dr["OwnerShipTypeid"]);
                        obj.OwnerShipType = Convert.ToString(dr["OwnerShipType"]);
                        obj.LeaseDate = Convert.ToString(dr["LeaseDate"]);
                        obj.LeaseExpiryDate = Convert.ToString(dr["LeaseExpiryDate"]);
                        obj.Land712FilePath = Convert.ToString(dr["Land712FilePath"]);
                        obj.LeaseFilePath = Convert.ToString(dr["LeaseFilePath"]);
                        obj.GoogleMapPath = Convert.ToString(dr["GoogleMapPath"]);
                        obj.LandPhotoPath = Convert.ToString(dr["LandPhotoPath"]);

                        obj.AvailableLandArea = Convert.ToDecimal(dr["AvailableLandArea"]);
                        obj.RequiredLandArea = Convert.ToDecimal(dr["RequiredLandArea"]);
                        obj.Variation = Convert.ToDecimal(dr["Variation"]);
                        obj.DistanceToInstitute = Convert.ToDecimal(dr["DistanceToInstitute"]);
                        obj.LandTypeCode = Convert.ToString(dr["LandTypeCode"]);
                        obj.LandType = Convert.ToString(dr["LandType"]);
                        obj.Latitude = Convert.ToString(dr["Latitude"]);
                        obj.Longitude = Convert.ToString(dr["Longitude"]);
                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);

                        ls.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return ls;
        }
        public string SaveLandDetails(LandDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveLandDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveLandDetails");
                throw ex;
            }
            return returnval;
        }
        public string DeleteLandDetails(long InstituteID, long LandId, string UserLoginID, string IPAddress)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteLandDetails(InstituteID, LandId, UserLoginID, IPAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteLandDetails");
                throw ex;
            }
            return returnval;
        }

        // Workshop
        public List<WorkshopEntity> GetWorkshopDetails(InstituteInputEntity entity)
        {
            List<WorkshopEntity> ls = new List<WorkshopEntity>();
            try
            {
                DataSet ds = objData.GetWorkshopDetails(entity);
                ls = ExtractWorkshopDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetWorkshopDetails");
                throw ex;
            }
            return ls;
        }
        public List<WorkshopEntity> ExtractWorkshopDetails(DataSet ds)
        {
            WorkshopEntity obj = new WorkshopEntity();
            List<WorkshopEntity> ls = new List<WorkshopEntity>();

            //var response = new WorkshopStatusResponse();


            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    //DataRow dr = ds.Tables[0].Rows[0];
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new WorkshopEntity();
                        obj.InstituteId = dr["InstituteID"] == DBNull.Value ? 0 : Convert.ToInt64(dr["InstituteID"]);
                        obj.WorkshopId = dr["WorkshopId"] == DBNull.Value ? 0 : Convert.ToInt32(dr["WorkshopId"]);
                        obj.CourseID = dr["CourseID"] == DBNull.Value ? 0 : Convert.ToInt32(dr["CourseID"]);
                        obj.CourseCode = dr["CourseCode"] == DBNull.Value ? "" : Convert.ToString(dr["CourseCode"]);
                        obj.Course = dr["Course"] == DBNull.Value ? "" : Convert.ToString(dr["Course"]);
                        obj.CourseCodeName = dr["CourseCodeName"] == DBNull.Value ? "" : Convert.ToString(dr["CourseCodeName"]);

                        obj.InspectionUnits = dr["InspectionUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionUnits"]);
                        obj.MaxTraningSetupRequired = dr["MaxTraningSetupRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["MaxTraningSetupRequired"]);
                        obj.PerSetupNorm = dr["PerSetupNorm"] == DBNull.Value ? 0 : Convert.ToInt32(dr["PerSetupNorm"]);
                        obj.RequiredSpace = dr["RequiredSpace"] == DBNull.Value ? 0 : Convert.ToInt32(dr["RequiredSpace"]);
                        obj.SpaceAvailable = dr["SpaceAvailable"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SpaceAvailable"]);
                        obj.SpaceAvailability = dr["SpaceAvailability"] == DBNull.Value ? 0 : Convert.ToInt32(dr["SpaceAvailability"]);

                        obj.ApprovedUnits = dr["ApprovedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ApprovedUnits"]);
                        obj.ProposedUnits = dr["ProposedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ProposedUnits"]);
                        obj.TotalUnits = dr["TotalUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TotalUnits"]);

                        obj.WorkSpaceForApprovedUnits = dr["WorkSpaceForApprovedUnits"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["WorkSpaceForApprovedUnits"]);
                        obj.WorkSpaceForProposedUnits = dr["WorkSpaceForProposedUnits"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["WorkSpaceForProposedUnits"]);
                        obj.WorkSpaceForTotalUnits = dr["WorkSpaceForTotalUnits"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["WorkSpaceForTotalUnits"]);

                        obj.AvailableWorkshopSpace = dr["AvailableWorkshopSpace"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["AvailableWorkshopSpace"]);
                        obj.WorkshopSpaceVariation = dr["WorkshopSpaceVariation"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["WorkshopSpaceVariation"]);

                        obj.FloorId = dr["FloorId"] == DBNull.Value ? 0 : Convert.ToInt32(dr["FloorId"]);
                        obj.FloorPref = dr["FloorPref"] == DBNull.Value ? "" : Convert.ToString(dr["FloorPref"]);

                        obj.AvailableFloorId = dr["AvailableFloorId"] == DBNull.Value ? 0 : Convert.ToInt32(dr["AvailableFloorId"]);
                        obj.AvailableFloorPref = dr["AvailableFloorPref"] == DBNull.Value ? "" : Convert.ToString(dr["AvailableFloorPref"]);
                        obj.FloorPrefVariation = dr["FloorPrefVariation"] == DBNull.Value ? "" : Convert.ToString(dr["FloorPrefVariation"]);
                        obj.WorkshopPhotoPath = dr["WorkshopPhotoPath"] == DBNull.Value ? "" : Convert.ToString(dr["WorkshopPhotoPath"]);

                        obj.IsEditAllowed = dr["IsEditAllowed"] == DBNull.Value ? false : Convert.ToBoolean(dr["IsEditAllowed"]);


                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? "" : dr["ModelCurriculum"].ToString();

                        ls.Add(obj);

                        //if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                        //{
                        //    var row = ds.Tables[1].Rows[0];
                        //    response.SpaceRemark = row["SpaceRemark"] != DBNull.Value ? row["SpaceRemark"].ToString() : string.Empty;
                        //    response.FloorRemark = row["FloorRemark"] != DBNull.Value ? row["FloorRemark"].ToString() : string.Empty;
                        //}
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return ls;
        }
        public string SaveWorkshopDetails(WorkshopEntity entity)
        {
            string returnval = "Data not Saved.";
            try
            {
                returnval = objData.SaveWorkshopDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveWorkshopDetails");
                throw ex;
            }
            return returnval;
        }
        public string SaveWorkshopPhotoPath(WorkshopEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveWorkshopPhotoPath(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveWorkshopPhotoPath");
                throw ex;
            }
            return returnval;
        }
        public string DeleteWorkshopPhotoPath(WorkshopEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteWorkshopPhotoPath(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteWorkshopPhotoPath");
                throw ex;
            }
            return returnval;
        }

        public WorkshopSpaceRemarkEntity GetWorkshopSpaceRemark(long instituteId)
        {
            WorkshopSpaceRemarkEntity result = null;
            try
            {
                DataSet ds = objData.GetWorkshopSpaceRemark(instituteId);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[0].Rows[0];
                    result = new WorkshopSpaceRemarkEntity
                    {
                        InstituteId = Convert.ToInt64(row["InstituteId"]),
                        SpaceRemark = row["SpaceRemark"].ToString()
                    };
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetWorkshopSpaceRemark", "");
                throw;
            }

            return result;
        }

        //Common Facility


        public CommonFacilityEntity ExtractCommonSubFacility(DataSet ds)
        {
            CommonFacilityEntity entity = new CommonFacilityEntity();
            CommonSubFacilityEntity obj = new CommonSubFacilityEntity();
            List<CommonSubFacilityEntity> ls = new List<CommonSubFacilityEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    //DataRow dr = ds.Tables[0].Rows[0];
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new CommonSubFacilityEntity();
                        obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                        obj.FacilityGroupId = Convert.ToInt32(dr["FacilityGroupId"]);
                        obj.SubFacilityGroupId = Convert.ToInt32(dr["SubFacilityGroupId"]);
                        obj.RequiredNumber = Convert.ToInt32(dr["RequiredNumber"]);
                        obj.AvailableNumber = Convert.ToInt32(dr["AvailableNumber"]);
                        obj.NumberVariation = Convert.ToInt32(dr["NumberVariation"]);

                        obj.FacilityGroupId = Convert.ToInt32(dr["FacilityGroupId"]);

                        obj.FacilityGroup = Convert.ToString(dr["FacilityGroup"]);
                        obj.SubFacilityGroup = Convert.ToString(dr["SubFacilityGroup"]);

                        obj.RequiredSpace = Convert.ToDecimal(dr["RequiredSpace"]);
                        obj.RequiredFinalSpace = Convert.ToDecimal(dr["RequiredFinalSpace"]);
                        obj.AvailableSpace = Convert.ToDecimal(dr["AvailableSpace"]);
                        obj.SpaceVariation = Convert.ToDecimal(dr["SpaceVariation"]);

                        obj.IsActive = Convert.ToBoolean(dr["IsActive"]);
                        obj.HasMultiplyFactor = Convert.ToBoolean(dr["HasMultiplyFactor"]);
                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.PhotoPath = Convert.ToString(dr["PhotoPath"]);

                        entity.lstcommonSubFacilityEntities.Add(obj);
                    }
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[1].Rows.Count > 0)
                    {
                        TraningEquipmentPhotoEntity traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                        List<TraningEquipmentPhotoEntity> lstPhoto = new List<TraningEquipmentPhotoEntity>();
                        foreach (DataRow dr in ds.Tables[1].Rows)
                        {
                            traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                            traningEquipmentPhotoEntity.InstituteID = Convert.ToInt64(dr["InstituteId"]);
                            traningEquipmentPhotoEntity.CourseID = Convert.ToInt64(dr["CourseId"]);
                            traningEquipmentPhotoEntity.PhotoPath = Convert.ToString(dr["PhotoPath"]);
                            traningEquipmentPhotoEntity.ID = Convert.ToInt64(dr["Id"]);
                            lstPhoto.Add(traningEquipmentPhotoEntity);
                        }
                        entity.lstTraningEquipmentPhoto = lstPhoto;
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return entity;
        }
        public CommonFacilityEntity GetMasterSubFacilityGroup(long InstituteID)
        {
            CommonFacilityEntity commonFacilityEntity = new CommonFacilityEntity();

            try
            {
                DataSet ds = objData.GetMasterSubFacilityGroup(InstituteID);
                commonFacilityEntity = ExtractCommonSubFacility(ds);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterSubFacilityGroup");
                throw ex;
            }
            return commonFacilityEntity;
        }
        public DataSet GetCommonFacilityCourseDetails(long InstituteID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetCommonFacilityCourseDetails(InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCommonFacilityCourseDetails");
                throw ex;
            }
            return ds;
        }
        public string SaveFacilityDetails(CommonSubFacilityEntity entity)
        {
            string returnval = "Data not Saved.";
            try
            {
                returnval = objData.SaveFacilityDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFacilityDetails");
                throw ex;
            }
            return returnval;
        }

        public string SaveCommonPhotoPath(WorkshopEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveCommonPhotoPath(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCommonPhotoPath");
                throw ex;
            }
            return returnval;
        }
        public string DeleteCommonPhotoPath(WorkshopEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteCommonPhotoPath(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCommonPhotoPath");
                throw ex;
            }
            return returnval;
        }


        // new common facility 
        public List<SubFacilityEntity> GetSubFacilityDetails(SubFacilityInputEntity entity)
        {
            List<SubFacilityEntity> ls = new List<SubFacilityEntity>();
            try
            {
                DataSet ds = objData.GetSubFacilityDetails(entity);
                ls = ExtractSubFacilityDetails(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSubFacilityDetails");
                throw ex;
            }
            return ls;
        }

        private List<SubFacilityEntity> ExtractSubFacilityDetails(DataSet ds)
        {
            List<SubFacilityEntity> ls = new List<SubFacilityEntity>();

            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
            {
                foreach (DataRow dr in ds.Tables[0].Rows)
                {
                    SubFacilityEntity entity = new SubFacilityEntity
                    {
                        Id = Convert.ToInt64(dr["Id"]),
                        InstituteId = Convert.ToInt64(dr["InstituteId"]),
                        FacilityGroupId = Convert.ToInt32(dr["FacilityGroupId"]),
                        SubFacilityGroupId = Convert.ToInt32(dr["SubFacilityGroupId"]),
                        FacilityGroup = dr["FacilityGroup"].ToString(),
                        SubFacilityGroup = dr["SubFacilityGroup"].ToString(),
                        AvailableSpace = dr["AvailableSpace"] != DBNull.Value
                            ? Convert.ToDecimal(dr["AvailableSpace"])
                            : (decimal?)null,
                        PhotoPath = dr["PhotoPath"] != DBNull.Value
                            ? dr["PhotoPath"].ToString()
                            : string.Empty,
                        IsActive = Convert.ToBoolean(dr["IsActive"]),
                        CreatedDateTime = dr["CreatedDateTime"] != DBNull.Value
                            ? Convert.ToDateTime(dr["CreatedDateTime"])
                            : (DateTime?)null,
                        ModifiedDateTime = dr["ModifiedDateTime"] != DBNull.Value
                            ? Convert.ToDateTime(dr["ModifiedDateTime"])
                            : (DateTime?)null,
                        CreatedBy = dr["CreatedBy"] != DBNull.Value
                    ? dr["CreatedBy"].ToString()
                    : string.Empty,
                        ModifiedBy = dr["ModifiedBy"] != DBNull.Value
                    ? dr["ModifiedBy"].ToString()
                    : string.Empty,
                        RowNumber = Convert.ToInt32(dr["RowNumber"]),
                        TotalCount = Convert.ToInt32(dr["TotalCount"]),
                        IsCourse = Convert.ToBoolean(dr["IsCourse"]),

                        Course = dr["Course"] != DBNull.Value
                    ? dr["Course"].ToString()
                    : string.Empty,

                        RequiredSeprate = dr["RequiredSeprate"] != DBNull.Value
                    ? dr["RequiredSeprate"].ToString()
                    : string.Empty,

                        RequiredSpace = dr["RequiredSpace"] != DBNull.Value
                    ? dr["RequiredSpace"].ToString()
                    : string.Empty,

                        Status = dr["Status"] != DBNull.Value
                    ? dr["Status"].ToString()
                    : string.Empty
                    };
                    ls.Add(entity);
                }
            }

            return ls;
        }

        public string SaveSubFacilityDetail(SubFacilitySaveEntity entity)
        {
            string result = string.Empty;
            try
            {
                result = objData.SaveSubFacilityDetail(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSubFacilityDetail");
                throw ex;
            }
            return result;
        }

        public string SaveSubFacilityDetails(SubFacilityBulkSaveEntity entity)
        {
            string result = string.Empty;
            try
            {
                result = objData.SaveSubFacilityDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSubFacilityDetails");
                throw ex;
            }
            return result;
        }

        public string DeleteSubFacilityDetail(SubFacilityDeleteEntity entity)
        {
            string result = string.Empty;
            try
            {
                result = objData.DeleteSubFacilityDetail(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteSubFacilityDetail");
                throw ex;
            }
            return result;
        }

        // other infra 
        public OtherInfraEntity GetOtherInfraDetails(long InstituteID)
        {
            DataSet ds = null;
            OtherInfraEntity entity = null;
            try
            {
                ds = objData.GetOtherInfraDetails(InstituteID);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        entity = new OtherInfraEntity();
                        entity.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                        entity.IsWaterSupply = Convert.ToInt16(dr["IsWaterSupply"]);
                        entity.SourceofWaterSupplyID = Convert.ToInt16(dr["SourceofWaterSupply"]);
                        entity.SourceofWaterSupply = Convert.ToString(dr["OtherInfraOption"]);
                        entity.OtherSourceofWaterSupply = Convert.ToString(dr["OtherSourceofWaterSupply"]);
                        entity.WaterSupplyPhoto = Convert.ToString(dr["WaterSupplyPhoto"]);
                        entity.InternetConnectivity = dr["InternetConnectivity"] == DBNull.Value ? -1 : Convert.ToInt16(dr["InternetConnectivity"]); //ADDED 
                        entity.CctvAvailable = dr["CctvAvailable"] == DBNull.Value ? -1 : Convert.ToInt16(dr["CctvAvailable"]);  // ADDED 

                        entity.IsDisplayBoard = Convert.ToInt16(dr["IsDisplayBoard"]);
                        entity.IsBoardasperNorms = Convert.ToInt16(dr["IsBoardasperNorms"]);
                        entity.BoardPhoto = Convert.ToString(dr["BoardPhoto"]);

                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetOtherInfraDetails");
                throw ex;
            }
            return entity;
        }


        public string SaveOtherInfraPhotoPath(OtherInfraEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveOtherInfraPhotoPath(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOtherInfraPhotoPath");
                throw ex;
            }
            return returnval;
        }

        public string SaveOtherInfraDetails(OtherInfraEntity entity)
        {
            string returnval = "Data not Saved.";
            try
            {
                returnval = objData.SaveOtherInfraDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveOtherInfraDetails");
                throw ex;
            }
            return returnval;
        }

        // Bank
        public List<InstituteBankEntity> GetInstituteBank(long InstituteId)
        {
            List<InstituteBankEntity> lstBank = new List<InstituteBankEntity>();
            InstituteBankEntity obj = new InstituteBankEntity();
            try
            {
                DataTable dt = objData.GetInstituteBank(InstituteId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new InstituteBankEntity();
                        obj.BankRowId = Convert.ToInt32(dr["BankRowId"]);
                        obj.InstituteID = Convert.ToInt64(dr["InstituteID"]);
                        obj.AccountType = Convert.ToString(dr["AccountType"]);
                        obj.AccountNo = Convert.ToString(dr["AccountNo"]);
                        obj.AccountHolderName = Convert.ToString(dr["AccountHolderName"]);
                        obj.IFSCCode = Convert.ToString(dr["IFSCCode"]);
                        obj.BankName = Convert.ToString(dr["BankName"]);
                        obj.BranchName = Convert.ToString(dr["BranchName"]);
                        obj.CancelChequePath = Convert.ToString(dr["CancelChequePath"]);
                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);
                        lstBank.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteBank", InstituteId.ToString());
                throw ex;
            }
            return lstBank;
        }
        public string SaveInstituteBank(InstituteBankEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInstituteBank(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteBank", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string DeleteInstituteBank(InstituteBankEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteInstituteBank(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Bank has not been Deleted. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteInstituteBank", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }


        /// Power details

        //public PowerInfoEntity GetPowerDetails(InstituteInputEntity inputEntity)
        //{
        //    List<CoursewisePowerRequirementEntity> lstPower = new List<CoursewisePowerRequirementEntity>();
        //    CoursewisePowerRequirementEntity obj = new CoursewisePowerRequirementEntity();
        //    PowerInfoEntity entity = new PowerInfoEntity();

        //    try
        //    {
        //        DataSet ds = objData.GetPowerDetails(inputEntity);

        //        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //        {
        //            foreach (DataRow dr in ds.Tables[0].Rows)
        //            {
        //                obj = new CoursewisePowerRequirementEntity();
        //                obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
        //                obj.CourseID = Convert.ToInt64(dr["CourseID"]);
        //                obj.CourseCode = Convert.ToString(dr["CourseCode"]);
        //                obj.Course = Convert.ToString(dr["Course"]);
        //                obj.CourseCodeName = Convert.ToString(dr["CourseCodeName"]);
        //                obj.ApprovedUnits = Convert.ToInt32(dr["ApprovedUnits"]);
        //                obj.ProposedUnits = Convert.ToInt32(dr["ProposedUnits"]);
        //                obj.TotalUnits = Convert.ToInt32(dr["TotalUnits"]);
        //                obj.RequiredPerUnit = Convert.ToInt32(dr["RequiredPerUnit"]);
        //                obj.PhaseType = Convert.ToString(dr["PhaseType"]);
        //                obj.RequiredPowerForApprovedUnits = Convert.ToInt32(dr["RequiredPowerForApprovedUnits"]);
        //                obj.RequiredPowerForProposedUnits = Convert.ToInt32(dr["RequiredPowerForProposedUnits"]);
        //                obj.RequiredPowerForTotalUnits = Convert.ToInt32(dr["RequiredPowerForTotalUnits"]);
        //                obj.InspectionUnits = dr["InspectionUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionUnits"]);


        //                obj.MaxTraningSetupRequired = Convert.ToInt32(dr["MaxTraningSetupRequired"]);
        //                obj.PerSetupPowerNorm = Convert.ToInt32(dr["PerSetupPowerNorm"]);
        //                obj.RequiredPower = Convert.ToInt32(dr["RequiredPower"]);
        //                lstPower.Add(obj);
        //            }
        //            entity.LstRequiredPowerDetails = lstPower;

        //            if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
        //            {
        //                entity.AvailablePower = Convert.ToInt32(ds.Tables[1].Rows[0]["AvailablePower"]);
        //                entity.AvailablePhase = Convert.ToString(ds.Tables[1].Rows[0]["AvailablePhase"]);
        //                entity.ElectricityBillPath = Convert.ToString(ds.Tables[1].Rows[0]["ElectricityBillPath"]);
        //                entity.IsEditAllowed = Convert.ToBoolean(ds.Tables[1].Rows[0]["IsEditAllowed"]);
        //                entity.IsDeleteAllowed = Convert.ToBoolean(ds.Tables[1].Rows[0]["IsDeleteAllowed"]);
        //                entity.IsMeterConnectionProposedInstitute = Convert.ToInt32(ds.Tables[1].Rows[0]["IsMeterConnectionProposedInstitute"]);
        //                entity.IsMeterConnectionPromotingOrganization = Convert.ToInt32(ds.Tables[1].Rows[0]["IsMeterConnectionPromotingOrganization"]);
        //                entity.MeterNOCfromOwner = Convert.ToString(ds.Tables[1].Rows[0]["MeterNOCfromOwner"]);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetPowerDetails", inputEntity.InstituteId.ToString());
        //        throw ex;
        //    }

        //    return entity;

        //}

        public PowerInfoEntity GetPowerDetails(InstituteInputEntity inputEntity)
        {
            List<CoursewisePowerRequirementEntity> lstPower = new List<CoursewisePowerRequirementEntity>();
            PowerInfoEntity entity = new PowerInfoEntity();

            try
            {
                DataSet ds = objData.GetPowerDetails(inputEntity);

                if (ds == null || ds.Tables.Count == 0)
                    return entity;


                if (ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        var obj = new CoursewisePowerRequirementEntity
                        {
                            InstituteId = Convert.ToInt64(dr["InstituteID"]),
                            CourseID = Convert.ToInt64(dr["CourseID"]),
                            CourseCode = Convert.ToString(dr["CourseCode"]),
                            // Course = Convert.ToString(dr["Course"]),
                            CourseCodeName = Convert.ToString(dr["CourseCodeName"]),
                            //ApprovedUnits = Convert.ToInt32(dr["ApprovedUnits"]),
                            //ProposedUnits = Convert.ToInt32(dr["ProposedUnits"]),
                            //TotalUnits = Convert.ToInt32(dr["TotalUnits"]),
                            RequiredPerUnit = Convert.ToInt32(dr["RequiredPerUnit"]),
                            PhaseType = Convert.ToString(dr["PhaseType"]),
                            //RequiredPowerForApprovedUnits = Convert.ToInt32(dr["RequiredPowerForApprovedUnits"]),
                            //RequiredPowerForProposedUnits = Convert.ToInt32(dr["RequiredPowerForProposedUnits"]),
                            //RequiredPowerForTotalUnits = Convert.ToInt32(dr["RequiredPowerForTotalUnits"]),
                            InspectionUnits = dr["InspectionUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionUnits"]),
                            MaxTraningSetupRequired = Convert.ToInt32(dr["MaxTraningSetupRequired"]),
                            PerSetupPowerNorm = Convert.ToInt32(dr["PerSetupPowerNorm"]),
                            RequiredPower = Convert.ToInt32(dr["RequiredPower"]),
                            
                            ModelCurriculum = dr["ModelCurriculum"] != DBNull.Value ? dr["ModelCurriculum"].ToString() : string.Empty,


                        };

                        lstPower.Add(obj);
                    }

                    entity.LstRequiredPowerDetails = lstPower;
                }
                else
                {
                    // Ensure not null in Swagger
                    entity.LstRequiredPowerDetails = new List<CoursewisePowerRequirementEntity>();
                }


                if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    DataRow row = ds.Tables[1].Rows[0];

                    entity.AvailablePower = row["AvailablePower"] == DBNull.Value ? 0 : Convert.ToInt32(row["AvailablePower"]);
                    entity.AvailablePhase = row["AvailablePhase"] == DBNull.Value ? "" : Convert.ToString(row["AvailablePhase"]);
                    entity.RequiredSupplyType = row["RequiredSupplyType"] == DBNull.Value ? "" : Convert.ToString(row["RequiredSupplyType"]);  // added  
                    entity.PowerAvailability = row["PowerAvailability"] == DBNull.Value ? 0 : Convert.ToInt32(row["PowerAvailability"]);
                    entity.ElectricityBillPath = row["ElectricityBillPath"] == DBNull.Value ? "" : Convert.ToString(row["ElectricityBillPath"]);
                    entity.IsEditAllowed = row["IsEditAllowed"] != DBNull.Value && Convert.ToBoolean(row["IsEditAllowed"]);
                    entity.IsDeleteAllowed = row["IsDeleteAllowed"] != DBNull.Value && Convert.ToBoolean(row["IsDeleteAllowed"]);
                    entity.IsMeterConnectionProposedInstitute =
    row["IsMeterConnectionProposedInstitute"] == DBNull.Value ||
    string.IsNullOrWhiteSpace(row["IsMeterConnectionProposedInstitute"].ToString())
        ? (int?)null
        : Convert.ToInt32(row["IsMeterConnectionProposedInstitute"]);
                    entity.IsMeterConnectionPromotingOrganization =
    row["IsMeterConnectionPromotingOrganization"] == DBNull.Value ||
    string.IsNullOrWhiteSpace(row["IsMeterConnectionPromotingOrganization"].ToString())
        ? (int?)null
        : Convert.ToInt32(row["IsMeterConnectionPromotingOrganization"]);

                    entity.MeterNOCfromOwner = row["MeterNOCfromOwner"] == DBNull.Value ? "" : Convert.ToString(row["MeterNOCfromOwner"]);
                    entity.PowerRemark = row["PowerRemark"] == DBNull.Value ? "" : Convert.ToString(row["PowerRemark"]);  // added  
                    entity.SupplyTypeRemark = row["SupplyTypeRemark"] == DBNull.Value ? "" : Convert.ToString(row["SupplyTypeRemark"]);  // added  

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPowerDetails", inputEntity.InstituteId.ToString());
                throw;
            }

            return entity;
        }

        public string SavePowerDetails(PowerInfoSaveRequest entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SavePowerDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }


            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SavePowerDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }


        //Staff

        public List<CourseSubjectwiseStaffEntity> GetCourseSubjectwiseStaffMappingDetails(long InstituteId, string userLoginId)
        {
            List<CourseSubjectwiseStaffEntity> lstStaff = new List<CourseSubjectwiseStaffEntity>();
            CourseSubjectwiseStaffEntity obj = new CourseSubjectwiseStaffEntity();
            try
            {
                DataTable dt = objData.GetCourseSubjectwiseStaffMappingDetails(InstituteId, userLoginId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new CourseSubjectwiseStaffEntity();
                        obj.CourseSubjectwiseStaffMappingId = Convert.ToInt64(dr["CourseSubjectwiseStaffMappingId"]);
                        obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                        obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                        obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                        obj.Course = Convert.ToString(dr["Course"]);
                        obj.ShiftId = Convert.ToInt32(dr["ShiftId"]);
                        obj.Shift = Convert.ToString(dr["Shift"]);
                        obj.UnitNo = Convert.ToString(dr["UnitNo"]);
                        obj.SubjectId = Convert.ToInt32(dr["SubjectId"]);
                        obj.Subject = Convert.ToString(dr["Subject"]);
                        obj.SubjectCode = Convert.ToString(dr["SubjectCode"]);
                        obj.StaffProfileId = Convert.ToString(dr["StaffProfileId"]);
                        obj.StaffFullName = Convert.ToString(dr["StaffFullName"]);
                        obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                        obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);
                        lstStaff.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSubjectwiseStaffMappingDetails", InstituteId.ToString());
                throw ex;
            }
            return lstStaff;
        }
        public List<CourseSubjectwiseDetailsEntity> GetCoursewiseSubjectDetails(long InstituteId, string userLoginId)
        {
            List<CourseSubjectwiseDetailsEntity> lstCourseSubject = new List<CourseSubjectwiseDetailsEntity>();
            CourseSubjectwiseDetailsEntity obj = new CourseSubjectwiseDetailsEntity();
            try
            {
                DataTable dt = objData.GetCoursewiseSubjectDetails(InstituteId, userLoginId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new CourseSubjectwiseDetailsEntity();
                        obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                        obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                        obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                        obj.Course = Convert.ToString(dr["Course"]);
                        obj.ShiftId = Convert.ToInt32(dr["ShiftId"]);
                        obj.Shift = Convert.ToString(dr["Shift"]);
                        obj.UnitNo = Convert.ToString(dr["UnitNo"]);
                        obj.SubjectId = Convert.ToInt32(dr["SubjectId"]);
                        obj.Subject = Convert.ToString(dr["Subject"]);
                        obj.SubjectCode = Convert.ToString(dr["SubjectCode"]);

                        lstCourseSubject.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseSubjectwiseStaffMappingDetails", InstituteId.ToString());
                throw ex;
            }
            return lstCourseSubject;
        }

        public string SaveCourseSubjectwiseStaffMappingDetails(CourseSubjectwiseStaffEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveCourseSubjectwiseStaffMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseSubjectwiseStaffMappingDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string DeleteCourseSubjectwiseStaffMappingDetails(CourseSubjectwiseStaffEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteCourseSubjectwiseStaffMappingDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been delete. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCourseSubjectwiseStaffMappingDetails", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }



        // Training Equipment

        //public List<TrainingEquipmentStatusEntity> GetTrainingEquipmentDetails(InstituteInputEntity inputEntity)
        //{
        //    List<TrainingEquipmentStatusEntity> lstTrainingEquipment = new List<TrainingEquipmentStatusEntity>();

        //    try
        //    {
        //        DataSet ds = objData.GetTrainingEquipmentDetails(inputEntity);

        //        if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //        {
        //            foreach (DataRow dr in ds.Tables[0].Rows)
        //            {
        //                var obj = new TrainingEquipmentStatusEntity(); // ✅ FIX

        //                obj.InstituteId = dr["InstituteID"] != DBNull.Value ? Convert.ToInt64(dr["InstituteID"]) : 0;
        //                obj.CourseID = dr["CourseID"] != DBNull.Value ? Convert.ToInt64(dr["CourseID"]) : 0;
        //                obj.CourseCode = dr["CourseCode"]?.ToString() ?? string.Empty;
        //                obj.CourseCodeName = dr["CourseCodeName"]?.ToString() ?? string.Empty;
        //                obj.Course = dr["Course"]?.ToString() ?? string.Empty;

        //                obj.ApprovedUnits = dr["ApprovedUnits"] != DBNull.Value ? Convert.ToInt32(dr["ApprovedUnits"]) : 0;
        //                obj.ProposedUnits = dr["ProposedUnits"] != DBNull.Value ? Convert.ToInt32(dr["ProposedUnits"]) : 0;
        //                obj.TotalUnits = dr["TotalUnits"] != DBNull.Value ? Convert.ToInt32(dr["TotalUnits"]) : 0;
        //                obj.InspectionUnits = dr["InspectionUnits"] != DBNull.Value ? Convert.ToInt32(dr["InspectionUnits"]) : 0;

        //                obj.MaxBatchPerDay = dr["MaxBatchPerDay"] != DBNull.Value ? Convert.ToInt32(dr["MaxBatchPerDay"]) : 0;
        //                obj.MaxRequiredTrainingSetup = dr["MaxRequiredTrainingSetup"] != DBNull.Value ? Convert.ToInt32(dr["MaxRequiredTrainingSetup"]) : 0;

        //                obj.PercentageAvailability = dr["PercentageAvailability"] != DBNull.Value
        //                    ? Convert.ToDecimal(dr["PercentageAvailability"])
        //                    : 0;

        //                obj.MOUApplicableStatus = dr["MOUApplicableStatus"]?.ToString() ?? string.Empty;

        //                lstTrainingEquipment.Add(obj);
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetTrainingEquipmentDetails", inputEntity.InstituteId.ToString());
        //        throw;
        //    }

        //    return lstTrainingEquipment;
        //}

        // Replace the existing GetTrainingEquipmentDetails method with this implementation.

        public TrainingEquipmentStatusResponse GetTrainingEquipmentDetails(InstituteInputEntity inputEntity)
        {
            var response = new TrainingEquipmentStatusResponse();

            try
            {
                DataSet ds = objData.GetTrainingEquipmentDetails(inputEntity);

                // TABLE 0 → Items
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        var obj = new TrainingEquipmentStatusEntity();

                        obj.InstituteId = dr["InstituteID"] != DBNull.Value ? Convert.ToInt64(dr["InstituteID"]) : 0;
                        obj.CourseID = dr["CourseID"] != DBNull.Value ? Convert.ToInt64(dr["CourseID"]) : 0;
                        obj.CourseCode = dr["CourseCode"]?.ToString() ?? string.Empty;
                        obj.CourseCodeName = dr["CourseCodeName"]?.ToString() ?? string.Empty;
                        obj.Course = dr["Course"]?.ToString() ?? string.Empty;

                        obj.ApprovedUnits = dr["ApprovedUnits"] != DBNull.Value ? Convert.ToInt32(dr["ApprovedUnits"]) : 0;
                        obj.ProposedUnits = dr["ProposedUnits"] != DBNull.Value ? Convert.ToInt32(dr["ProposedUnits"]) : 0;
                        obj.TotalUnits = dr["TotalUnits"] != DBNull.Value ? Convert.ToInt32(dr["TotalUnits"]) : 0;
                        obj.InspectionUnits = dr["InspectionUnits"] != DBNull.Value ? Convert.ToInt32(dr["InspectionUnits"]) : 0;

                        obj.MaxBatchPerDay = dr["MaxBatchPerDay"] != DBNull.Value ? Convert.ToInt32(dr["MaxBatchPerDay"]) : 0;
                        obj.MaxRequiredTrainingSetup = dr["MaxRequiredTrainingSetup"] != DBNull.Value ? Convert.ToInt32(dr["MaxRequiredTrainingSetup"]) : 0;

                        obj.PercentageAvailability = dr["PercentageAvailability"] != DBNull.Value
                            ? Convert.ToDecimal(dr["PercentageAvailability"])
                            : 0;

                        obj.MOUApplicableStatus = dr["MOUApplicableStatus"]?.ToString() ?? string.Empty;
                        obj.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? "" : Convert.ToString(dr["ModelCurriculum"]);


                        response.Items.Add(obj);
                    }
                }

                // TABLE 1 → Remarks (single row)
                if (ds != null && ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                {
                    var row = ds.Tables[1].Rows[0];
                    response.Remarks = row["Remarks"] != DBNull.Value ? row["Remarks"].ToString() : string.Empty;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTrainingEquipmentDetails", inputEntity.InstituteId.ToString());
                throw;
            }

            return response;
        }



        public TraningEquiplemntEntity GetTrainingEquipmentListDetails(InstituteInputEntity inputEntity)
        {
            List<TrainingEquipmentListEntity> lstTrainingEquipment = new List<TrainingEquipmentListEntity>();
            TrainingEquipmentListEntity obj = new TrainingEquipmentListEntity();
            TraningEquiplemntEntity entity = new TraningEquiplemntEntity();
            try
            {
                DataSet ds = objData.GetTrainingEquipmentListDetails(inputEntity);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    entity.lstTrainingEquipmentListEntity = ExtractTrainingEquipmentList(ds.Tables[0]);
                }
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[1].Rows.Count > 0)
                {
                    TraningEquipmentPhotoEntity traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                    List<TraningEquipmentPhotoEntity> lstPhoto = new List<TraningEquipmentPhotoEntity>();
                    foreach (DataRow dr in ds.Tables[1].Rows)
                    {
                        traningEquipmentPhotoEntity = new TraningEquipmentPhotoEntity();
                        traningEquipmentPhotoEntity.InstituteID = Convert.ToInt64(dr["InstituteId"]);
                        traningEquipmentPhotoEntity.CourseID = Convert.ToInt64(dr["CourseId"]);
                        traningEquipmentPhotoEntity.PhotoPath = Convert.ToString(dr["PhotoPath"]);
                        traningEquipmentPhotoEntity.ID = Convert.ToInt64(dr["Id"]);
                        lstPhoto.Add(traningEquipmentPhotoEntity);
                    }
                    entity.lstEquipmentPhoto = lstPhoto;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTrainingEquipmentListDetails", inputEntity.InstituteId.ToString());
                throw ex;
            }

            return entity;
        }

        public string UpdateTrainingEquipmentAvailability(List<TrainingEquipmentListEntity> lstTrainingEquipmentList, List<TraningEquipmentPhotoEntity> lstPhoto, string PageCode)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateTrainingEquipmentAvailability(lstTrainingEquipmentList, lstPhoto, PageCode);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been updated. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateTrainingEquipmentAvailability", "");
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<TrainingEquipmentListEntity> ExtractTrainingEquipmentList(DataTable dt)
        {
            List<TrainingEquipmentListEntity> lstTrainingEquipment = new List<TrainingEquipmentListEntity>();
            TrainingEquipmentListEntity obj = new TrainingEquipmentListEntity();

            foreach (DataRow dr in dt.Rows)
            {
                obj = new TrainingEquipmentListEntity();
                obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                obj.EquipmentId = Convert.ToInt32(dr["EquipmentId"]);
                obj.EquipmentName = Convert.ToString(dr["EquipmentName"]);
                obj.EquipmentCategoryId = Convert.ToInt32(dr["EquipmentCategoryId"]);
                obj.EquipmentCategory = Convert.ToString(dr["EquipmentCategory"]);
                obj.UtilizationRemarks = Convert.ToString(dr["UtilizationRemarks"]);
                obj.IsDsrItem = Convert.ToBoolean(dr["IsDsrItem"]);
                obj.IsMandatory = Convert.ToBoolean(dr["IsMandatory"]);
                obj.IsAlliedCourseItem = Convert.ToBoolean(dr["IsAlliedCourseItem"]);
                obj.IsMouItem = Convert.ToBoolean(dr["IsMouItem"]);
                obj.RequiredPerUnit = Convert.ToInt32(dr["RequiredPerUnit"]);
                obj.RequiredEquipmentForApprovedUnits = Convert.ToInt32(dr["RequiredEquipmentForApprovedUnits"]);
                obj.RequiredEquipmentForProposedUnits = Convert.ToInt32(dr["RequiredEquipmentForProposedUnits"]);
                obj.RequiredEquipmentForTotalUnits = Convert.ToInt32(dr["RequiredEquipmentForTotalUnits"]);
                obj.AvailableEquipments = Convert.ToInt32(dr["AvailableEquipments"]);
                obj.EquipmentStatus = Convert.ToString(dr["EquipmentStatus"]);
                obj.IsEditAllowed = Convert.ToBoolean(dr["IsEditAllowed"]);
                obj.IsDeleteAllowed = Convert.ToBoolean(dr["IsDeleteAllowed"]);
                obj.IsCourseMOU = Convert.ToInt16(dr["MOU"]);
                obj.MOUPath = Convert.ToString(dr["MOUPath"]);
                obj.Remark = Convert.ToInt16(dr["Remark"]);

                obj.DistanceBetweenInstituteAndMOU = dr["DistanceBetweenInstituteAndMOU"] != DBNull.Value ? (short)Convert.ToInt64(dr["DistanceBetweenInstituteAndMOU"]) : (short)0;
                lstTrainingEquipment.Add(obj);
            }

            return lstTrainingEquipment;
        }


        /// Inspection Fee


        public List<InspectionFeeEntity> GetInspectionFeeList(InstituteInputEntity inputEntity)
        {
            List<InspectionFeeEntity> lst = new List<InspectionFeeEntity>();
            InspectionFeeEntity obj;
            try
            {
                DataSet ds = objData.GetInspectionFeeList(inputEntity);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        obj = new InspectionFeeEntity();

                        obj.InstituteId = Convert.ToInt64(dr["InstituteID"]);
                        obj.CourseID = Convert.ToInt32(dr["CourseID"]);
                        obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                        obj.Course = Convert.ToString(dr["Course"]);

                        obj.ApprovedUnits = Convert.ToInt32(dr["ApprovedUnits"]);
                        obj.ProposedUnits = Convert.ToInt32(dr["ProposedUnits"]);
                        obj.TotalUnits = Convert.ToInt32(dr["TotalUnits"]);
                        obj.InspectionUnits = Convert.ToInt32(dr["InspectionUnits"]);
                        obj.LOITotalUnits = Convert.ToInt32(dr["LOITotalUnits"]);
                        obj.LOIProposedUnits = Convert.ToInt32(dr["LOIProposedUnits"]);  // added 
                        obj.InspectionFee = Convert.ToInt32(dr["InspectionFee"]);
                        obj.SecurityDeposit = Convert.ToInt32(dr["SecurityDeposit"]);

                        obj.PerUnitInspectionFee = Convert.ToDecimal(dr["PerUnitInspectionFee"]);
                        obj.ApprovedUnitsInspectionFee = Convert.ToDecimal(dr["ApprovedUnitsInspectionFee"]);
                        obj.ProposedUnitsInspectionFee = Convert.ToDecimal(dr["ProposedUnitsInspectionFee"]);
                        obj.TotalUnitsInspectionFee = Convert.ToDecimal(dr["TotalUnitsInspectionFee"]);

                        obj.IsFeePaid = Convert.ToBoolean(dr["IsFeePaid"]);
                        obj.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? "" : Convert.ToString(dr["ModelCurriculum"]);

                        lst.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInspectionFeeList", inputEntity.InstituteId.ToString());
                throw ex;
            }

            return lst;
        }


        /// Inspection Request


        public DataSet GetInstituteInspectionAgencyList(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetInstituteInspectionAgencyList(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionAgencyList", entity.InstituteId.ToString());
            }
            return ds;
        }
        public DataSet GetInstituteInspectionDateRange(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetInstituteInspectionDateRange(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionDateRange", entity.InstituteId.ToString());

            }
            return ds;
        }

        //public string SaveInstituteInspectionDateRange(InstituteInputEntity entity, string startDate, string endDate, string submissionDate,string DelayRemark,string InspectionScheduledDateByDVETO, string DelayRemarkForActual ,string ActualInspectionDateByDVETO )
        public string SaveInstituteInspectionDateRange(SaveInspectionDateRangeRequest entity )
        {
            string retVal = "";
            try
            {
                //retVal = objData.SaveInstituteInspectionDateRange(entity, startDate, endDate, submissionDate, DelayRemark, InspectionScheduledDateByDVETO,DelayRemarkForActual, ActualInspectionDateByDVETO);
                retVal = objData.SaveInstituteInspectionDateRange(entity);

                if (string.IsNullOrWhiteSpace(retVal) ||
                    retVal.ToUpper() == "N" ||
                    (!retVal.Equals("Y", StringComparison.OrdinalIgnoreCase) && retVal.Length > 1))
                {
                    return retVal;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteInspectionDateRange", entity.Entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }


        // Self Declaration

        public string SaveSelfDeclarationPath(SaveSelfDeclarationRequest entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveSelfDeclarationPath(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSelfDeclarationPath", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetSelfDeclarationPath(InstituteInputEntity entity)
        {
            DataTable ds = null;
            try
            {
                ds = objData.GetSelfDeclarationPath(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSelfDeclarationPath", entity.InstituteId.ToString());

            }
            return ds;
        }

        public InstituteStatusEntity GetProposedInstituteStatus(Int64 InstituteID)
        {
            DataTable dt = null;
            InstituteStatusEntity lst = new InstituteStatusEntity();
            try
            {
                dt = objData.GetProposedInstituteStatus(InstituteID);
                if (dt != null)
                    if (dt.Rows.Count > 0)
                        foreach (DataRow item in dt.Rows)
                        {
                            return FillProposedInstituteStatus(item);
                        }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedInstituteStatus", InstituteID.ToString());

            }
            return lst;
        }
        protected InstituteStatusEntity FillProposedInstituteStatus(DataRow dr)
        {
            InstituteStatusEntity obj = new InstituteStatusEntity();

            obj.InstituteID = dr["InstituteID"] != DBNull.Value ? Convert.ToInt64(dr["InstituteID"]) : 0;
            obj.VersionNo = dr["VersionNo"] != DBNull.Value ? Convert.ToInt32(dr["VersionNo"]) : 0;
            obj.StepID = dr["StepID"] != DBNull.Value ? Convert.ToInt32(dr["StepID"]) : 0;

            obj.FormStatus = Convert.ToString(dr["FormStatus"]);

            obj.LastModifiedOn = dr["LastModifiedOn"] != DBNull.Value
                ? Convert.ToDateTime(dr["LastModifiedOn"])
                : (DateTime?)null;

            obj.LastModifiedBy = Convert.ToString(dr["LastModifiedBy"]);

            obj.LastModifiedByIPAddress = Convert.ToString(dr["LastModifiedByIPAddress"]);
            obj.LastModifiedPage = Convert.ToString(dr["LastModifiedPage"]);

            obj.SelfDeclarationPath = Convert.ToString(dr["SelfDeclarationPath"]);
            obj.LetterOfIntentPath = Convert.ToString(dr["LetterOfIntentPath"]);

            obj.IsLetterOfIntentGenerated = dr["IsLetterOfIntentGenerated"] != DBNull.Value
                && Convert.ToBoolean(dr["IsLetterOfIntentGenerated"]);

            obj.LetterOfIntentGenerationDate = dr["LetterOfIntentGenerationDate"] != DBNull.Value
                ? Convert.ToDateTime(dr["LetterOfIntentGenerationDate"])
                : (DateTime?)null;

            obj.IsPaymentTransactionApproved = Convert.ToString(dr["IsPaymentTransactionApproved"]);
            obj.PaymentTransactionRemark = Convert.ToString(dr["PaymentTransactionRemark"]);

            obj.IsPromotingOrganization = Convert.ToString(dr["IsPromotingOrganization"]);
            obj.PromotingOrganizationRemark = Convert.ToString(dr["PromotingOrganizationRemark"]);

            obj.IsPromotors = Convert.ToString(dr["IsPromotors"]);
            obj.PromotorsRemark = Convert.ToString(dr["PromotorsRemark"]);

            obj.IsProposedInstitute = Convert.ToString(dr["IsProposedInstitute"]);
            obj.ProposedInstituteRemark = Convert.ToString(dr["ProposedInstituteRemark"]);

            obj.IsProposedCourses = Convert.ToString(dr["IsProposedCourses"]);
            obj.ProposedCoursesRemark = Convert.ToString(dr["ProposedCoursesRemark"]);

            obj.IsSelfDeclaration = Convert.ToString(dr["IsSelfDeclaration"]);
            obj.SelfDeclarationRemark = Convert.ToString(dr["SelfDeclarationRemark"]);

            obj.IsApplicationforLetterofIntent = Convert.ToString(dr["IsApplicationforLetterofIntent"]);
            obj.ApplicationforLetterofIntent = Convert.ToString(dr["ApplicationforLetterofIntent"]);

            obj.LetterOfIntentIssueDate = dr["LetterOfIntentIssueDate"] != DBNull.Value
                ? Convert.ToDateTime(dr["LetterOfIntentIssueDate"])
                : (DateTime?)null;

            obj.ISLetterOfIntentIssued = Convert.ToString(dr["ISLetterOfIntentIssued"]);
            return obj;
        }
    
// LOI

public string SaveLOIStatus(SaveLOIStatus entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveLOIStatus(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveLOIStatus", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public bool IsLOIGenerated(InstituteInputEntity entity)
        {
            bool retv = false;
            try
            {
                retv = objData.IsLOIGenerated(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsLOIGenerated", entity.InstituteId.ToString());

            }
            return retv;
        }
        public DataTable GetBuildingCourse(long InstituteID)
        {
            DataTable ds = null;
            try
            {
                ds = objData.GetBuildingCourse(InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetBuildingCourse", InstituteID.ToString());

            }
            return ds;

        }
        public DataTable GetAgricultureOpenGroudCourse(long InstituteID)
        {
            DataTable ds = null;
            try
            {
                ds = objData.GetAgricultureOpenGroudCourse(InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAgricultureOpenGroudCourse", InstituteID.ToString());

            }
            return ds;

        }

        //skill

        //public string SaveSkillProgram100days(Program100DaysEntity entity)
        //{
        //    string retVal = "";
        //    try
        //    {
        //        retVal = objData.SaveSkillProgram100days(entity);
        //        if (retVal.ToUpper() == "N")
        //        {
        //            retVal = "Data has not been saved. Please try again.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "SaveSkillProgram100days", entity.CreatedBy);
        //        retVal = ex.Message;
        //    }
        //    return retVal;
        //}
        //public Program100DaysEntity GetSkillProgram100daysByInstituteID(Int64 InstituteID)
        //{
        //    Program100DaysEntity entity = new Program100DaysEntity();
        //    DataSet ds = null;
        //    try
        //    {
        //        ds = objData.GetSkillProgram100daysByInstituteID(InstituteID);
        //        if (ds != null)
        //        {
        //            if (ds.Tables.Count > 0)
        //            {
        //                if (ds.Tables[0].Rows.Count > 0)
        //                {
        //                    entity.InstituteID = Convert.ToInt64(ds.Tables[0].Rows[0]["Instituteid"]);
        //                    entity.InstituteNameCode = ds.Tables[0].Rows[0]["InstituteNameCode"].ToString();
        //                    entity.InstituteCode = ds.Tables[0].Rows[0]["InstituteCode"].ToString();
        //                    entity.InstituteName = ds.Tables[0].Rows[0]["InstituteName"].ToString();
        //                    entity.DegitalLibaryComputer = Convert.ToInt32(ds.Tables[0].Rows[0]["DegitalLibaryComputer"]); 
        //                    entity.IsDigitalLib = ds.Tables[0].Rows[0]["IsDigitalLib"].ToString();
        //                    entity.IsTechnicalExhibition = ds.Tables[0].Rows[0]["IsTechnicalExhibition"].ToString();
        //                    entity.DateTechnicalExhibition = Convert.ToDateTime(ds.Tables[0].Rows[0]["DateTechnicalExhibition"].ToString());
        //                    entity.IsSportsCompetition = ds.Tables[0].Rows[0]["IsSportsCompetition"].ToString();
        //                    entity.DateSportsCompetition = Convert.ToDateTime(ds.Tables[0].Rows[0]["DateSportsCompetition"].ToString());
        //                }
        //                if (ds.Tables[1].Rows.Count > 0)
        //                {
        //                    List<TraningEquipmentPhotoEntity> lst = new List<TraningEquipmentPhotoEntity>();
        //                    foreach (DataRow dr in ds.Tables[1].Rows)
        //                    {
        //                        TraningEquipmentPhotoEntity photo = new TraningEquipmentPhotoEntity();
        //                        photo.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());
        //                        photo.PhotoPath = dr["PhotoPath"].ToString();
        //                        photo.PhotoType = Convert.ToInt16(dr["PhotoType"].ToString());
        //                        lst.Add(photo);
        //                    }

        //                    entity.lstSportsCompetitionPhoto = lst.Where(x => x.PhotoType == 3).ToList();
        //                    entity.lstTechnicalExhibitionPhoto = lst.Where(x => x.PhotoType == 2).ToList();
        //                    entity.lstPhoto = lst.Where(x => x.PhotoType == 1).ToList();
        //                }
        //                if (ds.Tables[2].Rows.Count > 0)
        //                {
        //                    List<MouItems> lstMouItems = new List<MouItems>();
        //                    foreach (DataRow dr in ds.Tables[2].Rows)
        //                    {
        //                        MouItems mou = new MouItems();
        //                        mou.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());
        //                        mou.NameofIndustry = dr["NameofIndustry"].ToString();
        //                        mou.AddressofIndustry = dr["AddressofInsustry"].ToString();
        //                        mou.District = Convert.ToInt32(dr["District"].ToString());
        //                        mou.ActivatesSelectedValue = dr["ActivatesSelectedValue"].ToString();
        //                        mou.ActivatesSelectedText = dr["ActivatesSelectedText"].ToString();
        //                        mou.MoUCopyPath = dr["MoUCopyPath"].ToString();
        //                        mou.DateofMou = Convert.ToDateTime(dr["DateofMou"].ToString());
        //                        mou.DistrictName = dr["DistrictName"].ToString();
        //                        lstMouItems.Add(mou);
        //                    }
        //                    entity.lstMouItems = lstMouItems;
        //                }
        //                if (ds.Tables[3].Rows.Count > 0)
        //                {
        //                    List<VideoLecturesEntity> lisVideoLecturesEntity = new List<VideoLecturesEntity>();
        //                    foreach (DataRow dr in ds.Tables[3].Rows)
        //                    {
        //                        VideoLecturesEntity video = new VideoLecturesEntity();
        //                        video.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());
        //                        video.NameofTopic = dr["NameofTopic"].ToString();
        //                        video.NameofStaff = dr["NameofStaff"].ToString();
        //                        video.StaffMobileNumber = dr["StaffMobileNumber"].ToString();
        //                        video.Trade = Convert.ToInt16(dr["Trade"].ToString());
        //                        video.YouTubeVideoLink = dr["YouTubeVideoLink"].ToString();
        //                        video.TradeName = dr["TradeName"].ToString();
        //                        lisVideoLecturesEntity.Add(video);
        //                    }
        //                    entity.lstVideoLecturesEntity = lisVideoLecturesEntity;
        //                }
        //            }
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetSkillProgram100daysByInstituteID", InstituteID.ToString());

        //    }
        //    return entity;
        //}

        public DataTable SearchSDILOI(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            DataTable ds = null;
            try
            {
                ds = objData.SearchSDILOI(DistrictID, TalukaID, RegionID, FormStatus, InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchSDILOI", InstituteID.ToString());

            }
            return ds;
        }
        public DataSet GetInstituteDash(Int64 InstituteID, string InstituteCode)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetInstituteDash(InstituteID, InstituteCode);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDash", InstituteID.ToString());

            }
            return ds;
        }

        public string UpdateInstituteVerificationStatus(Int64 InstituteID, string Remark, string Status, string Pagecode, string CreatedBy, string IpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateInstituteVerificationStatus(InstituteID, Remark, Status, Pagecode, CreatedBy, IpAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateInstituteVerificationStatus", InstituteID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        //public string UpdateProposedCourseUnitDetails(Int64 InstituteID, List<ProposedCourseUnitDetailsEntity> lst, string CreatedBy, string IpAddress)
        //{
        //    string retVal = "";
        //    try
        //    {
        //        retVal = objData.UpdateProposedCourseUnitDetails(InstituteID, lst, CreatedBy, IpAddress);
        //        if (retVal.ToUpper() == "N")
        //        {
        //            retVal = "Data has not been saved. Please try again.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "UpdateProposedCourseUnitDetails", InstituteID.ToString());
        //        retVal = ex.Message;
        //    }
        //    return retVal;

        //}



        public DataTable GetSuccessStoryResult(Int64 CandidateID, Int64 InstituteID)
        {
            DataTable dt = null;
            try
            {
                dt = objData.GetSuccessStoryResult(CandidateID, InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryResult", CandidateID.ToString());

            }
            return dt;
        }

        public string SaveSuccessStory(SucessStoryEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveSuccessStory(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveSuccessStory", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteSuccessStoryByID(Int64 ID, string UserLoginID, string @IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteSuccessStoryByID(ID, UserLoginID, @IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteSuccessStoryByID", ID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public SucessStoryEntity GetSuccessStoryByID(Int64 ID)
        {
            SucessStoryEntity entity = new SucessStoryEntity();
            try
            {
                DataTable dt = null;
                dt = objData.GetSuccessStoryByID(ID);
                return FillSucessStoryEntity(dt).FirstOrDefault();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryByID", ID.ToString());

            }
            return entity;
        }






        public List<SucessStoryEntity> GetSuccessStoryByInstituteID(Int64 InstituteID)
        {
            List<SucessStoryEntity> lst = new List<SucessStoryEntity>();
            try
            {
                DataTable dt = null;
                dt = objData.GetSuccessStoryByInstituteID(InstituteID);
                return FillSucessStoryEntity(dt);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSuccessStoryByInstituteID", InstituteID.ToString());

            }
            return lst;
        }

        private List<SucessStoryEntity> FillSucessStoryEntity(DataTable dt)
        {
            List<SucessStoryEntity> lst = new List<SucessStoryEntity>();

            foreach (DataRow dr in dt.Rows)
            {
                SucessStoryEntity entity = new SucessStoryEntity();
                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "ID"))
                    entity.ID = Convert.ToInt64(dr["ID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "FirstName"))
                    entity.FirstName = dr["FirstName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "MiddleName"))
                    entity.MiddleName = dr["MiddleName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "LastName"))
                    entity.LastName = dr["LastName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CandidateProfileID"))
                    entity.CandidateProfileID = dr["CandidateProfileID"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PhotoPath"))
                    entity.PhotoPath = dr["PhotoPath"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CourseID"))
                    entity.CourseID = Convert.ToInt64(dr["CourseID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "InstituteID"))
                    entity.InstituteID = Convert.ToInt64(dr["InstituteID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PassingYearID"))
                    entity.PassingYearID = Convert.ToInt32(dr["PassingYearID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PresentDesignation"))
                    entity.PresentDesignation = dr["PresentDesignation"].ToString().ToUpper();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PresentOrganization"))
                    entity.PresentOrganization = dr["PresentOrganization"].ToString().ToUpper();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "SelectionYearID"))
                    entity.SelectionYearID = Convert.ToInt32(dr["SelectionYearID"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "IsPublished"))
                    entity.IsPublished = Convert.ToBoolean(dr["IsPublished"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "IsActive"))
                    entity.IsActive = Convert.ToBoolean(dr["IsActive"].ToString());

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CourseName"))
                    entity.CourseName = dr["CourseName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CourseCode"))
                    entity.CourseCode = dr["CourseCode"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "InstituteCode"))
                    entity.InstituteCode = dr["InstituteCode"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "InstituteName"))
                    entity.InstituteName = dr["InstituteName"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PassingYear"))
                    entity.PassingYear = dr["PassingYear"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "PublishedStatus"))
                    entity.PublishedStatus = dr["PublishedStatus"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CourseNameCode"))
                    entity.CourseNameCode = dr["CourseNameCode"].ToString();
                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "InstituteNameCode"))
                    entity.InstituteNameCode = dr["InstituteNameCode"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "IsProfile"))
                    entity.IsProfile = dr["IsProfile"].ToString();
                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "SelectionYear"))
                    entity.SelectionYear = dr["SelectionYear"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "DocumentPath"))
                    entity.DocumentPath = dr["DocumentPath"].ToString();

                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CandidateMobileNo"))
                    entity.CandidateMobileNo = dr["CandidateMobileNo"].ToString();
                if (dt.Columns.Cast<DataColumn>().Any(c => c.ColumnName == "CandidateFullName"))
                    entity.CandidateFullName = dr["CandidateFullName"].ToString();

                lst.Add(entity);
            }

            return lst;

        }


        public List<SucessStoryEntity> GetPublishedSuccessStory()
        {
            List<SucessStoryEntity> lst = new List<SucessStoryEntity>();
            try
            {
                DataTable dt = null;
                dt = objData.GetPublishedSuccessStory();
                return FillSucessStoryEntity(dt);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPublishedSuccessStory", "");

            }
            return lst;
        }
        public List<SucessStoryEntity> SearchSuccessStory(Int32 DistrictID, Int32 SectorID, Int64 InstituteID, Int64 CoureseID, Int16 PublishStatus)
        {
            List<SucessStoryEntity> lst = new List<SucessStoryEntity>();
            try
            {
                DataTable dt = null;
                dt = objData.SearchSuccessStory(DistrictID, SectorID, InstituteID, CoureseID, PublishStatus);
                return FillSucessStoryEntity(dt);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllSuccessStory", "");

            }
            return lst;

        }

        public List<SucessStoryEntity> GetAllSuccessStory()
        {

            List<SucessStoryEntity> lst = new List<SucessStoryEntity>();
            try
            {
                DataTable dt = null;
                dt = objData.GetAllSuccessStory();
                return FillSucessStoryEntity(dt);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllSuccessStory", "");

            }
            return lst;

        }

        //public DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo)
        //{
        //    DataTable dt = new DataTable();
        //    try
        //    {
        //        dt = objData.GetDPDCDetailsByCollegeRegNo(CollegeRegistrationNo);
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetDPDCDetailsByCollegeRegNo " + CollegeRegistrationNo);
        //        throw;
        //    }
        //    return dt;
        //}

        public DataTable GetDPDCDetailsByCollegeRegNo(string CollegeRegistrationNo)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetDPDCDetailsByCollegeRegNo(CollegeRegistrationNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDPDCDetailsByCollegeRegNo " + CollegeRegistrationNo);
                throw;
            }
            return dt;
        }

        // SAVE/UPDATE DPDC Fund Data
        public string SaveDPDCFundData(DPDCFundEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveDPDCFundData(entity);
                if (retVal.ToUpper() == "N" || retVal.Contains("Error"))
                {
                    retVal = "DPDC Fund data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveDPDCFundData");
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<InstituteManagementDetailsEntity> GetInstituteManagementDetails(long instituteID)
        {
            List<InstituteManagementDetailsEntity> retVal = new List<InstituteManagementDetailsEntity>();
            try
            {
                retVal = objData.GetInstituteManagementDetails(instituteID);
                if (retVal == null)
                {
                    retVal = new List<InstituteManagementDetailsEntity>();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteManagementDetails", instituteID.ToString());
                throw;
            }
            return retVal;
        }

        
public string SaveInstituteManagementDetails(InstituteManagementDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveInstituteManagementDetails(entity);
                if (retVal.ToUpper() == "N" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else if(retVal.ToUpper() == "Y" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data saved successfully.";
                }
                 
                   
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveInstituteManagementDetails", entity.CreateBy);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteInstituteManagementDetails(InstituteManagementDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteInstituteManagementDetails(entity);
                if (retVal.ToUpper() == "N" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else if (retVal.ToUpper() == "Y" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data Delete successfully.";
                }


            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteInstituteManagementDetails", entity.StaffID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetInstituteProfileStatus(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetInstituteProfileStatus(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteProfileStatus InstituteID: " + InstituteID);
                throw ex;
            }
            return dt;
        }


        // InspectionUnits
        public List<InspectionUnitDetailsEntity> GetInspectionUnitDetails(long instituteID, int? approvalIDFlag)
        {
            List<InspectionUnitDetailsEntity> result = new List<InspectionUnitDetailsEntity>();

            try
            {
                DataSet ds = objData.GetInspectionUnitDetails_ExistingInstitute(instituteID, approvalIDFlag);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    InspectionUnitDetailsEntity entity = null;

                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        entity = new InspectionUnitDetailsEntity();

                        entity.InstituteId = dr["InstituteId"] == DBNull.Value ? 0 : Convert.ToInt64(dr["InstituteId"]);
                        entity.SectorID = dr["SectorID"] == DBNull.Value ? -1 : Convert.ToInt64(dr["SectorID"]);
                        entity.Sector = dr["Sector"] == DBNull.Value ? string.Empty : Convert.ToString(dr["Sector"]);
                        entity.CourseType = dr["CourseType"] == DBNull.Value ? string.Empty : Convert.ToString(dr["CourseType"]);
                        entity.CourseTypeID = dr["CourseTypeID"] == DBNull.Value ? -1 : Convert.ToInt64(dr["CourseTypeID"]);
                        entity.CourseID = dr["CourseID"] == DBNull.Value ? 0 : Convert.ToInt64(dr["CourseID"]);
                        entity.CourseCode = dr["CourseCode"] == DBNull.Value ? string.Empty : Convert.ToString(dr["CourseCode"]);
                        entity.Course = dr["Course"] == DBNull.Value ? string.Empty : Convert.ToString(dr["Course"]);
                        entity.CourseWithCourseCode = dr["CourseWithCourseCode"] == DBNull.Value ? string.Empty : Convert.ToString(dr["CourseWithCourseCode"]);

                        entity.ApprovedUnits = dr["ApprovedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ApprovedUnits"]);
                        entity.ProposedUnits = dr["ProposedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ProposedUnits"]);
                        entity.TotalUnits = dr["TotalUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["TotalUnits"]);
                        entity.LOIProposedUnits = dr["LOIProposedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["LOIProposedUnits"]);
                        entity.LOITotalUnits = dr["LOITotalUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["LOITotalUnits"]);

                        entity.InspectionFee = dr["InspectionFee"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["InspectionFee"]);
                        entity.SecurityDeposit = dr["SecurityDeposit"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["SecurityDeposit"]);
                        entity.PerUnitSecurityDeposit = dr["PerUnitSecurityDeposit"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["PerUnitSecurityDeposit"]);
                        entity.PerUnitInspectionFees = dr["PerUnitInspectionFees"] == DBNull.Value ? 0 : Convert.ToDecimal(dr["PerUnitInspectionFees"]);

                        entity.IsEditAllowed = dr["IsEditAllowed"] == DBNull.Value ? 0 : Convert.ToInt32(dr["IsEditAllowed"]);
                        entity.IsDeleteAllowed = dr["IsDeleteAllowed"] == DBNull.Value ? 0 : Convert.ToInt32(dr["IsDeleteAllowed"]);
                        entity.IsViewAllowed = dr["IsViewAllowed"] == DBNull.Value ? 0 : Convert.ToInt32(dr["IsViewAllowed"]);
                        entity.IsExistingCourse = dr["IsExistingCourse"] == DBNull.Value ? 0 : Convert.ToInt32(dr["IsExistingCourse"]);

                        entity.Remark = dr["Remark"] == DBNull.Value ? string.Empty : Convert.ToString(dr["Remark"]);
                        entity.PageStatus = dr["PageStatus"] == DBNull.Value ? string.Empty : Convert.ToString(dr["PageStatus"]);

                        entity.InspectionUnits = dr["InspectionUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["InspectionUnits"]);
                        entity.RecommendedUnits = dr["RecommendedUnits"] == DBNull.Value ? 0 : Convert.ToInt32(dr["RecommendedUnits"]);
                        entity.RecommendedUnitsByBoard = dr["RecommendedUnitsByBoard"] == DBNull.Value ? 0 : Convert.ToInt32(dr["RecommendedUnitsByBoard"]);
                        entity.ApprovedCategoryID = dr["ApprovedCategoryID"] == DBNull.Value ? 0 : Convert.ToInt32(dr["ApprovedCategoryID"]);
                        entity.ApprovedCategory = dr["ApprovedCategory"] == DBNull.Value ? string.Empty : Convert.ToString(dr["ApprovedCategory"]);

                        //entity.IsExistingInstitute = dr["IsExistingInstitute"] == DBNull.Value ? string.Empty : Convert.ToString(dr["IsExistingInstitute"]);
                        //entity.InstituteCode = dr["InstituteCode"] == DBNull.Value ? string.Empty : Convert.ToString(dr["InstituteCode"]);
                        //entity.DistrictCode = dr["DistrictCode"] == DBNull.Value ? string.Empty : Convert.ToString(dr["DistrictCode"]);
                        //entity.LastInstituteCodeInDistrict = dr["LastInstituteCodeInDistrict"] == DBNull.Value ? string.Empty : Convert.ToString(dr["LastInstituteCodeInDistrict"]);

                        entity.MaxBatchesPerDay = dr["MaxBatchesPerDay"] == DBNull.Value ? 2 : Convert.ToInt32(dr["MaxBatchesPerDay"]);
                        entity.MaxTraningSetupRequired = dr["MaxTraningSetupRequired"] == DBNull.Value ? 0 : Convert.ToInt32(dr["MaxTraningSetupRequired"]);
                        entity.ModelCurriculum = dr["ModelCurriculum"] == DBNull.Value ? string.Empty : Convert.ToString(dr["ModelCurriculum"]);


                        result.Add(entity);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInspectionUnitDetails");
                throw;
            }

            return result;
        }

        //inspection units
        public DataTable UpdateProposedCourseUnitDetailsForInspectionUnits(
       long instituteId,
       string proposedCourseXml,
       string createdBy,
       string ipAddress)
        {

            DataTable retVal = null;
            try
            {
                retVal = objData.UpdateProposedCourseUnitDetailsForInspectionUnits(
                    instituteId,
                    proposedCourseXml,
                    createdBy,
                    ipAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckInstituteRequestEligibility");
                throw;
            }
            return retVal;


        }


        // requirement summary 
        public RequirementInstitutionFundingResponse GetRequirementInstitutionFundingDetails(
        string financialYear,
        int? stateID,
        int? districtID,
        int? talukaID,
        string Status,
        int? RegionID)
        {
            RequirementInstitutionFundingResponse response = new RequirementInstitutionFundingResponse
            {
                Requirements = new List<RequirementInstitutionFundingSummaryEntity>(),
                Summary = new RequirementFundingTotalsEntity()
            };

            try
            {
                DataSet ds = objData.GetRequirementInstitutionFundingDetails(financialYear, stateID, districtID, talukaID, Status, RegionID);

                if (ds != null && ds.Tables.Count > 0)
                {
                    // Fill Requirements (First Result Set)
                    if (ds.Tables[0].Rows.Count > 0)
                    {
                        response.Requirements = FillRequirementInstitutionFundingSummaryEntity(ds.Tables[0]);
                    }

                    // Fill Summary (Second Result Set)
                    if (ds.Tables.Count > 1 && ds.Tables[1].Rows.Count > 0)
                    {
                        response.Summary = FillRequirementFundingTotalsEntity(ds.Tables[1]);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetRequirementInstitutionFundingDetails",
                    $"FinancialYear: {financialYear}, StateID: {stateID}, DistrictID: {districtID}, TalukaID: {talukaID}"
                );
                throw;
            }

            return response;
        }

        private List<RequirementInstitutionFundingSummaryEntity> FillRequirementInstitutionFundingSummaryEntity(DataTable dt)
        {
            List<RequirementInstitutionFundingSummaryEntity> list = new List<RequirementInstitutionFundingSummaryEntity>();

            try
            {
                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        list.Add(new RequirementInstitutionFundingSummaryEntity
                        {
                            RequirementID = dr["RequirementID"] != DBNull.Value ? Convert.ToInt64(dr["RequirementID"]) : 0,
                            UserID = dr["UserID"] != DBNull.Value ? Convert.ToInt64(dr["UserID"]) : 0,
                            CollegeID = dr["CollegeID"] != DBNull.Value ? dr["CollegeID"].ToString() : string.Empty,
                            CollegeName = dr["CollegeName"] != DBNull.Value ? dr["CollegeName"].ToString() : string.Empty,
                            CollegeRegistrationNo = dr["CollegeRegistrationNo"] != DBNull.Value ? dr["CollegeRegistrationNo"].ToString() : string.Empty,
                            ItemID = dr["ItemID"] != DBNull.Value ? Convert.ToInt64(dr["ItemID"]) : 0,
                            ItemName = dr["ItemName"] != DBNull.Value ? dr["ItemName"].ToString() : string.Empty,
                            ItemCode = dr["ItemCode"] != DBNull.Value ? dr["ItemCode"].ToString() : string.Empty,
                            SectorID = dr["SectorID"] != DBNull.Value ? Convert.ToInt64(dr["SectorID"]) : 0,
                            SectorName = dr["SectorName"] != DBNull.Value ? dr["SectorName"].ToString() : string.Empty,
                            CategoryID = dr["CategoryID"] != DBNull.Value ? Convert.ToInt64(dr["CategoryID"]) : 0,
                            CategoryName = dr["CategoryName"] != DBNull.Value ? dr["CategoryName"].ToString() : string.Empty,
                            DistrictFund = dr["DistrictFund"] != DBNull.Value ? Convert.ToDecimal(dr["DistrictFund"]) : 0,
                            PPP = dr["PPP"] != DBNull.Value ? Convert.ToDecimal(dr["PPP"]) : 0,
                            StateFund = dr["StateFund"] != DBNull.Value ? Convert.ToDecimal(dr["StateFund"]) : 0,
                            RequiredAsPerNorms = dr["RequiredAsPerNorms"] != DBNull.Value ? Convert.ToDecimal(dr["RequiredAsPerNorms"]) : 0,
                            Available = dr["Available"] != DBNull.Value ? Convert.ToDecimal(dr["Available"]) : 0,
                            Total = dr["Total"] != DBNull.Value ? Convert.ToDecimal(dr["Total"]) : 0,
                            FinancialYear = dr["FinancialYear"] != DBNull.Value ? dr["FinancialYear"].ToString() : string.Empty,
                            Status = dr["Status"] != DBNull.Value ? dr["Status"].ToString() : string.Empty,
                            SubmittedDate = dr["SubmittedDate"] != DBNull.Value ? Convert.ToDateTime(dr["SubmittedDate"]) : (DateTime?)null,
                            ApprovedDate = dr["ApprovedDate"] != DBNull.Value ? Convert.ToDateTime(dr["ApprovedDate"]) : (DateTime?)null,
                            ApprovedBy = dr["ApprovedBy"] != DBNull.Value ? dr["ApprovedBy"].ToString() : string.Empty,
                            Remarks = dr["Remarks"] != DBNull.Value ? dr["Remarks"].ToString() : string.Empty,
                            CreatedDateTime = dr["CreatedDateTime"] != DBNull.Value ? Convert.ToDateTime(dr["CreatedDateTime"]) : DateTime.MinValue,
                            ModifiedDateTime = dr["ModifiedDateTime"] != DBNull.Value ? Convert.ToDateTime(dr["ModifiedDateTime"]) : (DateTime?)null,
                            EstimatedPrice = dr["EstimatedPrice"] != DBNull.Value ? Convert.ToDecimal(dr["EstimatedPrice"]) : 0,
                            SpecificationDocument = dr["SpecificationDocument"] != DBNull.Value ? dr["SpecificationDocument"].ToString() : string.Empty,
                            CollegeStateID = dr["CollegeStateID"] != DBNull.Value ? dr["CollegeStateID"].ToString() : string.Empty,
                            CollegeDistrictID = dr["CollegeDistrictID"] != DBNull.Value ? dr["CollegeDistrictID"].ToString() : string.Empty,
                            CollegeTalukaID = dr["CollegeTalukaID"] != DBNull.Value ? dr["CollegeTalukaID"].ToString() : string.Empty
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "FillRequirementInstitutionFundingSummaryEntity", "");
                throw;
            }

            return list;
        }

        private RequirementFundingTotalsEntity FillRequirementFundingTotalsEntity(DataTable dt)
        {
            RequirementFundingTotalsEntity summary = new RequirementFundingTotalsEntity();

            try
            {
                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    summary.TotalRequirements = dr["TotalRequirements"] != DBNull.Value ? Convert.ToInt32(dr["TotalRequirements"]) : 0;
                    summary.TotalInstitutes = dr["TotalInstitutes"] != DBNull.Value ? Convert.ToInt32(dr["TotalInstitutes"]) : 0;
                    summary.DPDC_TotalAllottedToInstitute_Sum = dr["DPDC_TotalAllottedToInstitute_Sum"] != DBNull.Value ? Convert.ToDecimal(dr["DPDC_TotalAllottedToInstitute_Sum"]) : 0;
                    summary.PPP_BalanceAsOnDate_Sum = dr["PPP_BalanceAsOnDate_Sum"] != DBNull.Value ? Convert.ToDecimal(dr["PPP_BalanceAsOnDate_Sum"]) : 0;
                    summary.StateFund_Total_Sum = dr["StateFund_Total_Sum"] != DBNull.Value ? Convert.ToDecimal(dr["StateFund_Total_Sum"]) : 0;
                    summary.GrandTotal_Sum = dr["GrandTotal_Sum"] != DBNull.Value ? Convert.ToDecimal(dr["GrandTotal_Sum"]) : 0;



                    summary.AppliedFinancialYear = dr["AppliedFinancialYear"] != DBNull.Value ? dr["AppliedFinancialYear"].ToString() : "All Years";
                    summary.AppliedStateFilter = dr["AppliedStateFilter"] != DBNull.Value ? dr["AppliedStateFilter"].ToString() : "All States";
                    summary.AppliedDistrictFilter = dr["AppliedDistrictFilter"] != DBNull.Value ? dr["AppliedDistrictFilter"].ToString() : "All Districts";
                    summary.AppliedTalukaFilter = dr["AppliedTalukaFilter"] != DBNull.Value ? dr["AppliedTalukaFilter"].ToString() : "All Talukas";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "FillRequirementFundingTotalsEntity", "");
                throw;
            }

            return summary;
        }

        //inspection request 


        public InspectionEligibilityEntity CheckInspectionEligibility(InstituteInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionEligibilityEntity obj = new InspectionEligibilityEntity();

            try
            {
                DataTable dt = objData.CheckInspectionEligibility(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.CanRequestInspection = Convert.ToBoolean(dr["CanRequestInspection"]);
                    obj.CanWithdrawInspection = Convert.ToBoolean(dr["CanWithdrawInspection"]);
                    obj.InspectionStatus = Convert.ToString(dr["InspectionStatus"]);
                    obj.IsAllDataFilled = Convert.ToBoolean(dr["IsAllDataFilled"]);
                    obj.Message = Convert.ToString(dr["Message"]);
                    obj.MissingPages = Convert.ToString(dr["MissingPages"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckInspectionEligibility", entity.UserLoginID);
                throw;
            }

            return obj;
        }

        public InspectionOperationResult RequestInspection(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.RequestInspection(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RequestInspection", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }

        public InspectionOperationResult WithdrawInspection(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.WithdrawInspection(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "WithdrawInspection", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }

        public InspectionOperationResult SubmitInspectionRequest(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.SubmitInspectionRequest(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SubmitInspectionRequest", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }

        public InspectionOperationResult WithdrawInspectionRequest(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.WithdrawInspectionRequest(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];
                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "WithdrawInspectionRequest", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }


        //promotertype mobile number 
        public DataTable GetInstitute_PromoterTypeByInstituteID(long instituteId, int managementType)
        {
            DataTable dt = null;
            try
            {
                dt = objData.GetInstitute_PromoterTypeByInstituteID(instituteId, managementType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstitutePromoterTypeByInstituteID", instituteId.ToString());
            }
            return dt;
        }

        // dashboard for LOI approved institutes
        public DataSet GetInstituteDashboard(long? instituteId, string instituteCode)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetInstituteDashboard(instituteId, instituteCode);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteDashboard");
                throw ex;
            }
            return ds;
        }

        // temp dashbaord 

        public DataSet GetTempInstituteDashboard(long tempInstituteId)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetTempInstituteDashboard(tempInstituteId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTempInstituteDashboard");
                throw ex;
            }
            return ds;
        }

        //SearchSDIInspection

        public DataTable SearchSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID)
        {
            DataTable ds = null;
            try
            {
                ds = objData.SearchSDIInspection(DistrictID, TalukaID, RegionID, FormStatus, InstituteID, userID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchSDILOI", InstituteID.ToString());

            }
            return ds;
        }

        public DataTable SearchInstituteSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID , Int64 userID)
        {
            DataTable ds = null;

            try
            {
                ds = objData.SearchInstituteSDIInspection(
                        DistrictID,
                        TalukaID,
                        RegionID,
                        FormStatus,
                        InstituteID,
                        userID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstituteSDIInspection", InstituteID.ToString());
            }

            return ds;
        }
        

             public DataTable DVETOSubmittedInstituteSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID)
        {
            DataTable ds = null;

            try
            {
                ds = objData.DVETOSubmittedInstituteSDIInspection(
                        DistrictID,
                        TalukaID,
                        RegionID,
                        FormStatus,
                        InstituteID,
                        userID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETOSubmittedInstituteSDIInspection", InstituteID.ToString());
            }

            return ds;
        }



        public DataTable SecretaryInstituteSDIInspection(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID , int ResultTypeID)
        {
            DataTable ds = null;

            try
            {
                ds = objData.SecretaryInstituteSDIInspection(
                        DistrictID,
                        TalukaID,
                        RegionID,
                        FormStatus,
                        InstituteID,
                        userID,
                        ResultTypeID
                        );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryInstituteSDIInspection", InstituteID.ToString());
            }

            return ds;
        }

        public DataTable SecretaryInstituteSDIAffiliatio(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int64 userID, int ResultTypeID)
        {
            DataTable ds = null;

            try
            {
                ds = objData.SecretaryInstituteSDIAffiliatio(
                        DistrictID,
                        TalukaID,
                        RegionID,
                        FormStatus,
                        InstituteID,
                        userID,
                        ResultTypeID
                        );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryInstituteSDIAffiliatio", InstituteID.ToString());
            }

            return ds;
        }


        public DataSet GetShortTermApprovedCourseUnitDetails(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetShortTermApprovedCourseUnitDetails(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermApprovedCourseUnitDetails", entity.InstituteId.ToString());

            }
            return ds;
        }
        //Builiding 


        public DataSet GetSTTCourseUnitDetailsForApprovalByCoureseID(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetSTTCourseUnitDetailsForApprovalByCoureseID(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTCourseUnitDetailsForApprovalByCoureseID", entity.InstituteId.ToString());

            }
            return ds;
        }


        public string SaveShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.SaveShortTermProposedCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }


        public string DeleteShortTermProposedCourseUnitDetails(ProposedCourseUnitDetailsEntity entity)
        {
            string returnval = "N";
            try
            {
                returnval = objData.DeleteShortTermProposedCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }



        public DataSet GetShortTermProposedCourseUnitDetails(InstituteInputEntity entity)
        {
            DataSet ds = null;
            try
            {
                ds = objData.GetShortTermProposedCourseUnitDetails(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermProposedCourseUnitDetails", entity.InstituteId.ToString());

            }
            return ds;
        }


        public DataTable GetShortTermApprovedCourseFees(InstituteInputEntity entity)
        {
            DataTable ds = null;
            try
            {
                ds = objData.GetShortTermApprovedCourseFees(entity);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermApprovedCourseFees", entity.InstituteId.ToString());

            }
            return ds;
        }



        //Inspection page 
        public DataTable GetInstituteInspectionDash(long instituteId, string pageCode, int UserTypeID)
        {
            DataTable dt = null;

            try
            {
                dt = objData.GetInstituteInspectionDash(instituteId, pageCode, UserTypeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteInspectionDash", instituteId.ToString());
            }

            return dt;
        }

        public string UpdateInstituteInspectionVerificationStatus(InspectionVerificationEntity entity)
        {
            string retVal = "";

            try
            {
                retVal = objData.UpdateInstituteInspectionVerificationStatus(entity);

                if (string.IsNullOrWhiteSpace(retVal) ||
                    retVal.ToUpper() == "N")
                {
                    return retVal;
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateInstituteInspectionVerificationStatus", entity.CreatedBy);
                retVal = ex.Message;
            }

            return retVal;
        }
        public DataTable GetProposedCourseofGroupCourseApprovalGroupWise(Int32 ApprovalGroupID)
        {
            List<CourseInfoEntity> lst = new List<CourseInfoEntity>();
            try
            {
                return objData.GetProposedCourseofGroupCourseApprovalGroupWise(ApprovalGroupID);

                //if (dt != null &&   dt.Rows.Count > 0)
                //{
                //    foreach (DataRow dr in dt.Rows)
                //    {
                //        CourseInfoEntity obj = new CourseInfoEntity();
                //        //obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                //        //obj.CourseCode = Convert.ToString(dr["CourseCode"]);
                //        //obj.Course = Convert.ToString(dr["CourseName"]);
                //        //obj.SectorID = Convert.ToInt16(dr["SectorID"]);
                //        //obj.Sector = Convert.ToString(dr["Sector"]);
                //        //obj.SubSectorID = Convert.ToInt16(dr["SubSectorID"]);
                //        //obj.SubSector = Convert.ToString(dr["SubSector"]);
                //        //obj.CourseApproverID = Convert.ToInt16(dr["CourseApproverID"]);
                //        //obj.CourseApprover = Convert.ToString(dr["CourseApprover"]);
                //        //obj.CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]);
                //        //obj.CourseType = Convert.ToString(dr["CourseType"]);
                //        //obj.FullTimePartTime = Convert.ToString(dr["FullTimePartTime"]);
                //        //obj.Duration = Convert.ToInt16(dr["Duration"]);
                //        //obj.DurationUnit = Convert.ToString(dr["DurationUnit"]);
                //        //obj.MinimumEntryQualificationID = Convert.ToInt16(dr["MinimumEntryQualificationID"]);
                //        //obj.MinimumEntryQualification = Convert.ToString(dr["MinimumEntryQualification"]);
                //        //obj.MandatoryCriteriaAtEntryQualificationID = Convert.ToInt16(dr["MandatoryCriteriaAtEntryQualificationID"]);
                //        //obj.MandatoryCriteriaAtEntryQualification = Convert.ToString(dr["MandatoryCriteriaAtEntryQualification"]);
                //        //obj.MinimumAge = Convert.ToInt16(dr["MinimumAge"]);
                //        //obj.IntakePerUnit = Convert.ToInt16(dr["IntakePerUnit"]);
                //        //obj.NSQFLevel = Convert.ToString(dr["NSQFLevel"]);
                //        //obj.TrainingFeeCategory = Convert.ToInt16(dr["TrainingFeeCategory"]);
                //        //obj.LastModifiedOn = Convert.ToString(dr["LastModifiedOn"]);
                //        //obj.ModelCurriculumPath = Convert.ToString(dr["ModelCurriculumPath"]);
                //        //obj.QualificationPackPath = Convert.ToString(dr["QualificationPackPath"]);
                //        //obj.PerUnitSecurityDeposit = Convert.ToString(dr["PerUnitSecurityDeposit"]);
                //        //obj.PerUnitInspectionFees = Convert.ToString(dr["PerUnitInspectionFees"]);
                //        //obj.ApprovalGroupID = Convert.ToInt16(dr["ApprovalGroupID"]);
                //        obj.CourseNameDisplay = Convert.ToString(dr["CourseNameDisplay"]);
                //        lst.Add(obj);
                //    }
                //}
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseDetails");
                throw ex;
            }
            //return lst;
        }
        //public string SaveSelfDeclarationPath(SaveSelfDeclarationRequest entity)
        //{
        //    string retVal = "";
        //    try
        //    {
        //        retVal = objData.SaveSelfDeclarationPath(entity);
        //        if (retVal.ToUpper() == "N")
        //        {
        //            retVal = "Data has not been saved. Please try again.";
        //        }
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "SaveSelfDeclarationPath", entity.UserLoginID);
        //        retVal = ex.Message;
        //    }
        //    return retVal;
        //}

        public string UpdateProposedCourseUnitDetails(Int64 InstituteID, string ProposedCourseXml, string CreatedBy, string IpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateProposedCourseUnitDetails(InstituteID, ProposedCourseXml, CreatedBy, IpAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateProposedCourseUnitDetails", InstituteID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }






        public DataTable SearchInstitutes(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID)
        {
            DataTable ds = null;
            try
            {
                ds = objData.SearchInstitutes(DistrictID, TalukaID, RegionID, FormStatus, InstituteID);

            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchInstitutes", InstituteID.ToString());

            }
            return ds;
        }
        public DataTable GetBatchDetailsByInstitute(Int64 InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetBatchDetailsByInstitute(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GETBatchDetailsByBatchID InstituteID: " + InstituteID);
                throw ex;
            }
            return dt;
        }

        public string SaveCourseTrainingFee(string actionType, int? id, string trainingFeeID,
                                 decimal? withPlacement, decimal? withoutPlacement,
                                 string userName, string userIpAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveCourseTrainingFee(actionType, id, trainingFeeID,
                                 withPlacement, withoutPlacement,
                                 userName, userIpAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseTrainingFee", trainingFeeID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public bool IsCourseEligibleForApplication(Int64 CourseID)
        {
            bool returnval = false;
            try
            {
                returnval = objData.IsCourseEligibleForApplication(CourseID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteProposedCourseUnitDetails");
                throw ex;
            }
            return returnval;
        }












        // ── Election Duty   RO ─────────────────────────────────────

        public List<ElectionDutyListEntity> GetElectionDutyList(int UserID)
        {
            var list = new List<ElectionDutyListEntity>();
            try
            {
                DataSet ds = objData.GetElectionDutyList(UserID);
                if (ds?.Tables.Count > 0)
                    foreach (DataRow row in ds.Tables[0].Rows)
                        list.Add(MapElectionDutyListEntity(row));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetElectionDutyList");
                throw;
            }
            return list;
        }

        public List<ConstituencyEntity> GetConstituencyByDistrict(int districtID)
        {
            var list = new List<ConstituencyEntity>();
            try
            {
                DataSet ds = objData.GetConstituencyByDistrict(districtID);
                if (ds?.Tables.Count > 0)
                    foreach (DataRow row in ds.Tables[0].Rows)
                        list.Add(new ConstituencyEntity
                        {
                            Value = Convert.ToInt32(row["Value"]),
                            Text = row["Text"]?.ToString(),
                            ConstituencyMarathi = row["ConstituencyMarathi"]?.ToString()
                        });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetConstituencyByDistrict");
                throw;
            }
            return list;
        }

        public string SaveElectionDutyStaff(ElectionDutyStaffEntity entity)
        {
            try
            {
                return objData.SaveElectionDutyStaff(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveElectionDutyStaff");
                throw;
            }
        }

        public string UpdateElectionDutyDeputation(ElectionDutyDeputationEntity entity)
        {
            try
            {
                return objData.UpdateElectionDutyDeputation(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateElectionDutyDeputation");
                throw;
            }
        }

        public string DeleteElectionDutyStaff(DeleteElectionDutyStaffEntity entity)
        {
            try
            {
                return objData.DeleteElectionDutyStaff(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteElectionDutyStaff");
                throw;
            }
        }

        public string DeleteElectionDutyDeputation(DeleteElectionDutyDeputationEntity entity)
        {
            try
            {
                return objData.DeleteElectionDutyDeputation(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteElectionDutyDeputation");
                throw;
            }
        }

        // ── Private mapper ────────────────────────────────────
        //private ElectionDutyListEntity MapElectionDutyListEntity(DataRow row)
        //{
        //    return new ElectionDutyListEntity
        //    {
        //        ElectionDutyStaffID = Convert.ToInt32(row["ElectionDutyStaffID"]),
        //        StaffID = Convert.ToInt32(row["StaffID"]),
        //        ProfileID = row["ProfileID"]?.ToString(),
        //        Title = row["Title"]?.ToString(),
        //        FullName = row["FullName"]?.ToString(),
        //        FirstName = row["FirstName"]?.ToString(),
        //        MiddleName = row["MiddleName"]?.ToString(),
        //        LastName = row["LastName"]?.ToString(),
        //        MobileNo = row["MobileNo"]?.ToString(),
        //        EMailID = row["EMailID"]?.ToString(),
        //        GenderCode = row["GenderCode"]?.ToString(),
        //        Designation = row["Designation"]?.ToString(),
        //        DeputationID = Convert.ToInt32(row["DeputationID"]),
        //        DeputationFrom = row["DeputationFrom"]?.ToString(),
        //        DeputationTo = row["DeputationTo"]?.ToString(),
        //        DistrictID = Convert.ToInt32(row["DistrictID"]),
        //        District = row["District"]?.ToString(),
        //        ConstituencyID = Convert.ToInt32(row["ConstituencyID"]),
        //        Constituency = row["Constituency"]?.ToString(),
        //        NatureOfDeputation = row["NatureOfDeputation"]?.ToString()
        //    };
        //}




        private ElectionDutyListEntity MapElectionDutyListEntity(DataRow row)
        {
            return new ElectionDutyListEntity
            {
                ElectionDutyStaffID = row["ElectionDutyStaffID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ElectionDutyStaffID"]),
                StaffID = row["StaffID"] == DBNull.Value ? 0 : Convert.ToInt32(row["StaffID"]),
                ProfileID = row["ProfileID"]?.ToString(),
                Title = row["Title"]?.ToString(),
                FullName = row["FullName"]?.ToString(),
                FirstName = row["FirstName"]?.ToString(),
                MiddleName = row["MiddleName"]?.ToString(),
                LastName = row["LastName"]?.ToString(),
                MobileNo = row["MobileNo"]?.ToString(),
                EMailID = row["EMailID"]?.ToString(),
                GenderCode = row["GenderCode"]?.ToString(),
                Designation = row["Designation"]?.ToString(),

                DeputationID = row["DeputationID"] == DBNull.Value ? 0 : Convert.ToInt32(row["DeputationID"]),
                DeputationFrom = row["DeputationFrom"]?.ToString(),
                DeputationTo = row["DeputationTo"]?.ToString(),

                DistrictID = row["DistrictID"] == DBNull.Value ? 0 : Convert.ToInt32(row["DistrictID"]),
                District = row["District"]?.ToString(),

                ConstituencyID = row["ConstituencyID"] == DBNull.Value ? 0 : Convert.ToInt32(row["ConstituencyID"]),
                Constituency = row["Constituency"]?.ToString(),

                NatureOfDeputation = row["NatureOfDeputation"]?.ToString(),
                AssigenedByAuthority =
            row.Table.Columns.Contains("AssigenedByAuthority") &&
            row["AssigenedByAuthority"] != DBNull.Value
                ? row["AssigenedByAuthority"].ToString()
                : string.Empty
            };
        }







        //report 



        public List<ElectionDutyListEntity> Report_GetElectionDutyList(
            int RegionID,
            int DistrictID,
           int TalukaID,
            int StaffID)
        {
            var list = new List<ElectionDutyListEntity>();
            try
            {
                DataSet ds = objData.Report_GetElectionDutyList(
                    RegionID,
                    DistrictID,
                    TalukaID,
                    StaffID
);
                if (ds?.Tables.Count > 0)
                    foreach (DataRow row in ds.Tables[0].Rows)
                    {
                        foreach (DataColumn col in row.Table.Columns)
                        {
                            Console.WriteLine($"{col.ColumnName} = {row[col]}");
                        }

                        list.Add(MapElectionDutyListEntity(row));
                    }
            }
            //catch (Exception ex)
            //{
            //    CommonHelper.SaveException(ex.Message, "ReportGetElectionDutyList");
            //    throw;
            //}
            catch (Exception ex)
            {
                throw;
            }
            return list;
        }

        public DataTable Institute_GetCourseInspectionFeeDetails(int InstituteID, int CourseID, int ApprovalID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.Institute_GetCourseInspectionFeeDetails(  InstituteID,  CourseID,  ApprovalID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseInspectionFeeDetails InstituteID: " + InstituteID);
                throw ex;
            }
            return dt;
        }

        public DataTable Institute_GetCourseSecurityFeeDetails(int InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.Institute_GetCourseSecurityFeeDetails(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Institute_GetCourseSecurityFeeDetails InstituteID: " + InstituteID);
                throw ex;
            }
            return dt;
        }

        // verification by board for inspection phase 
        public VerificationEligibilityEntity CheckVerificationEligibility(InstituteInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            VerificationEligibilityEntity obj = new VerificationEligibilityEntity();

            try
            {
                DataTable dt = objData.CheckVerificationEligibility(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.IsEligible = Convert.ToBoolean(dr["IsEligible"]);
                    obj.Message = Convert.ToString(dr["Message"]);
                    obj.VerificationStatus = Convert.ToString(dr["VerificationStatus"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckVerificationEligibility", entity.UserLoginID);
                throw;
            }

            return obj;
        }

        public InspectionOperationResult RequestVerification(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.RequestVerification(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RequestVerification", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }

        public InspectionOperationResult WithdrawVerification(InspectionRequestEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            InspectionOperationResult result = new InspectionOperationResult();

            try
            {
                DataTable dt = objData.WithdrawVerification(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    result.IsSuccess = Convert.ToBoolean(dr["IsSuccess"]);
                    result.Message = Convert.ToString(dr["Message"]);
                }
                else
                {
                    result.IsSuccess = false;
                    result.Message = "No response from database.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "WithdrawVerification", entity.UserLoginID);
                result.IsSuccess = false;
                result.Message = ex.Message;
            }

            return result;
        }
        

        public string SDI_GenerateInstituteCode(Int64 InstituteID, string MSBVCollegeID,string IpAddress)
        {
            try
            {
                return objData.SDI_GenerateInstituteCode(InstituteID, MSBVCollegeID, IpAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SDI_GenerateInstituteCode", InstituteID.ToString());
                return ex.Message;
            }
        }
        public DataTable SDI_GetInstituteCodeDetails(int InstituteID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.SDI_GetInstituteCodeDetails(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SDI_GetInstituteCodeDetails : " + InstituteID);
                throw ex;
            }
            return dt;
        }





        public DataTable SecretaryDVETOInstituteStatus(Int32 DistrictID, Int32 TalukaID, Int32 RegionID, string FormStatus, Int64 InstituteID, Int32 ResultTypeID, Int64 userID = -1)
        {
            DataTable ds = null;

            try
            {
                ds = objData.SecretaryDVETOInstituteStatus(
                        DistrictID,
                        TalukaID,
                        RegionID,
                        FormStatus,
                        InstituteID,
                        ResultTypeID,
                        userID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SecretaryDVETOInstituteStatus", InstituteID.ToString());
            }

            return ds;
        }



        public List<ApprovalOrderSummaryEntity> GetApprovalOrdersByYear(int Year)
        {
            List<ApprovalOrderSummaryEntity> objList = new List<ApprovalOrderSummaryEntity>();
            try
            {
                DataSet ds = objData.GetApprovalOrdersByYear(Year);
                objList = ExtractApprovalOrderList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApprovalOrdersByYear");
                throw ex;
            }
            return objList;
        }

        public List<ApprovalOrderSummaryEntity> ExtractApprovalOrderList(DataSet ds)
        {
            List<ApprovalOrderSummaryEntity> lst = new List<ApprovalOrderSummaryEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        ApprovalOrderSummaryEntity obj = new ApprovalOrderSummaryEntity();

                        obj.ApprovalOrderID = Convert.ToInt64(dr["ApprovalOrderID"]);
                        obj.ApprovalOrderNo = Convert.ToString(dr["ApprovalOrderNo"]);
                        if (!(dr["ApprovalOrderDate"] is DBNull))
                            obj.ApprovalOrderDate = Convert.ToDateTime(dr["ApprovalOrderDate"]);
                        obj.ApprovalOrder = Convert.ToString(dr["ApprovalOrder"]);
                        obj.IsActive = Convert.ToBoolean(dr["IsActive"]);

                        lst.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return lst;
        }

        public List<CourseApprovalOrderDetailEntity> SaveCourseApprovalOrder(SaveCourseApprovalOrderEntity entity)
        {
            List<CourseApprovalOrderDetailEntity> objList = new List<CourseApprovalOrderDetailEntity>();
            try
            {
                DataSet ds = objData.SaveCourseApprovalOrder(entity);
                objList = ExtractCourseApprovalOrderDetailList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCourseApprovalOrder");
                throw ex;
            }
            return objList;
        }

        public List<CourseApprovalOrderDetailEntity> ExtractCourseApprovalOrderDetailList(DataSet ds)
        {
            List<CourseApprovalOrderDetailEntity> lst = new List<CourseApprovalOrderDetailEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        CourseApprovalOrderDetailEntity obj = new CourseApprovalOrderDetailEntity();

                        obj.CollegeID = Convert.ToInt64(dr["CollegeID"]);
                        obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                        
                        obj.CourseName = Convert.ToString(dr["CourseName"]);
                        obj.ShiftID = Convert.ToInt16(dr["ShiftID"]);
                        obj.UnitNo = Convert.ToInt16(dr["UnitNo"]);
                        obj.UnitCode = Convert.ToString(dr["UnitCode"]);
                        obj.Intake = Convert.ToInt16(dr["Intake"]);
                        if (!(dr["ApprovedCategory"] is DBNull))
                            obj.ApprovedCategory = Convert.ToString(dr["ApprovedCategory"]);
                        if (!(dr["ApprovalOrderID"] is DBNull))
                            obj.ApprovalOrderID = Convert.ToInt64(dr["ApprovalOrderID"]);
                        //if (!(dr["ApprovalOrderYear"] is DBNull))               // NEW
                        //    obj.ApprovalOrderYear = Convert.ToInt32(dr["ApprovalOrderYear"]);
                        if (!(dr["ApprovalOrderNo"] is DBNull))
                            obj.ApprovalOrderNo = Convert.ToString(dr["ApprovalOrderNo"]);
                        if (!(dr["ApprovalOrder"] is DBNull))
                            obj.ApprovalOrder = Convert.ToString(dr["ApprovalOrder"]);
                        if (!(dr["EffectiveDate"] is DBNull))
                            obj.EffectiveDate = Convert.ToDateTime(dr["EffectiveDate"]);

                        lst.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return lst;
        }

        public List<CourseDetailsWithApprovalOrderEntity> GetCourseDetailsWithApprovalOrder(long CollegeID, string IpAddress)
        {
            List<CourseDetailsWithApprovalOrderEntity> objList = new List<CourseDetailsWithApprovalOrderEntity>();
            try
            {
                DataSet ds = objData.GetCourseDetailsWithApprovalOrder(CollegeID, IpAddress);
                objList = ExtractCourseDetailsWithApprovalOrderList(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCourseDetailsWithApprovalOrder");
                throw ex;
            }
            return objList;
        }

        public List<CourseDetailsWithApprovalOrderEntity> ExtractCourseDetailsWithApprovalOrderList(DataSet ds)
        {
            List<CourseDetailsWithApprovalOrderEntity> lst = new List<CourseDetailsWithApprovalOrderEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        CourseDetailsWithApprovalOrderEntity obj = new CourseDetailsWithApprovalOrderEntity();

                        obj.CourseID = Convert.ToInt64(dr["CourseID"]);
                        obj.CourseName = Convert.ToString(dr["CourseName"]);
                        obj.ShiftID = Convert.ToInt16(dr["ShiftID"]);
                        obj.UnitNo = Convert.ToInt16(dr["UnitNo"]);
                        obj.UnitCode = Convert.ToString(dr["UnitCode"]);
                        obj.Intake = Convert.ToInt16(dr["Intake"]);
                        if (!(dr["ApprovedCategory"] is DBNull))
                            obj.ApprovedCategory = Convert.ToString(dr["ApprovedCategory"]);
                        if (!(dr["ApprovalOrderNo"] is DBNull))
                            obj.ApprovalOrderNo = Convert.ToString(dr["ApprovalOrderNo"]);
                        if (!(dr["ApprovalOrderYear"] is DBNull))               // NEW
                            obj.ApprovalOrderYear = Convert.ToInt32(dr["ApprovalOrderYear"]);
                        if (!(dr["ApprovalOrderID"] is DBNull))                                  // NEW
                            obj.ApprovalOrderID = Convert.ToInt64(dr["ApprovalOrderID"]);
                        if (!(dr["ApprovalOrder"] is DBNull))
                            obj.ApprovalOrder = Convert.ToString(dr["ApprovalOrder"]);
                        if (!(dr["ApprovalOrderDate"] is DBNull))
                            obj.ApprovalOrderDate = Convert.ToDateTime(dr["ApprovalOrderDate"]);
                        if (!(dr["EffectiveDate"] is DBNull))
                            obj.EffectiveDate = Convert.ToDateTime(dr["EffectiveDate"]);

                        lst.Add(obj);
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return lst;
        }

        // green requieremnt 
        public string SaveGreenFieldRequirement(GreenFieldRequirementEntity entity)
        {
            string returnval = "N";

            try
            {
                returnval = objData.SaveGreenFieldRequirement(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "SaveGreenFieldRequirement");

                throw;
            }

            return returnval;
        }

        public DataSet GetGreenFieldRequirement(
    InstituteInputEntityForGreen entity)
        {
            try
            {
                return objData.GetGreenFieldRequirement(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetGreenFieldRequirement");

                throw;
            }
        }

        public string SaveStatusGreenRequirementAsync(
    StatusGreenRequirementRequest entity)
        {
            string returnval = "N";

            try
            {
                returnval = objData.SaveStatusGreenRequirement(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "SaveStatusGreenRequirement");

                throw;
            }

            return returnval;
        }


        public DataTable GetStatusGreenRequirementAsync(
            InstituteInputEntityForGreen entity)
        {
            try
            {
                return objData.GetStatusGreenRequirement(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetStatusGreenRequirement");

                throw;
            }
        }

        public string UnlockStatusGreenRequirementAsync(
    StatusGreenRequirementRequest entity)
        {
            string returnval = "N";

            try
            {
                returnval = objData.UnlockStatusGreenRequirement(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "UnlockStatusGreenRequirement");

                throw;
            }

            return returnval;
        }

        // bulk save

        public string SaveGreenFieldRequirementBulk(
    GreenFieldRequirementBulkEntity entity)
        {
            string returnval = "N";

            try
            {
                returnval =
                    objData.SaveGreenFieldRequirementBulk(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "SaveGreenFieldRequirementBulk");

                throw;
            }

            return returnval;
        }

        public DataTable GetCourseRenewalDetails(int CollegeID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetCourseRenewalDetails(CollegeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "Institute_GetCourseRenewalDetails : " + CollegeID);
                throw ex;
            }
            return dt;
        }

    }




}

