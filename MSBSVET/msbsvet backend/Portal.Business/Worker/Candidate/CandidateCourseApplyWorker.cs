using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateCourseApplyWorker : ICandidateCourseApply
    {
        private readonly Repository _repository;

        public CandidateCourseApplyWorker(Repository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository), "Repository instance cannot be null");
        }

        public string ApplyForCourse(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            string retVal = "";
            try
            {
                retVal = _repository.ApplyForCourse(entity);
                //if (retVal.ToUpper() == "N")
                //{
                //    retVal = "Data has not been saved. Please try again.";
                //}
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ApplyForCourse", entity.CandidateID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<InstituteListEntity> GetAppliedCourse(long CandidateID, long ApplicationID, short AdmissionYearID)
        {
            try
            {
                DataSet ds = _repository.GetAppliedCourse(CandidateID, ApplicationID, AdmissionYearID);
                return ExtractAppliedCourse(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAppliedCourse", CandidateID.ToString());
                throw;
            }
        }
        public List<InstituteListEntity> GetAppliedCourseByCandidateID(long CandidateID, long ApplicationID)
        {
            List<InstituteListEntity> obj;
            try
            {
                DataSet ds = _repository.GetAppliedCourseByCandidateID(CandidateID, ApplicationID);
                obj = ExtractAppliedCourse(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAppliedCourseByCandidateID", CandidateID.ToString());
                throw ex;
            }
            return obj;
        }
        
        public List<InstituteListEntity> GetAppliedCourseByCandidateID(long CandidateID)
        {
            try
            {
                DataSet ds = _repository.GetAppliedCourseByCandidateID(CandidateID);
                return ExtractAppliedCourse(ds);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAppliedCourseByCandidateID", CandidateID.ToString());
                throw;
            }
        }



        public List<InstituteListEntity> ExtractAppliedCourse(DataSet ds)
        {
            List<InstituteListEntity> listInstitute = new List<InstituteListEntity>();
            try
            {
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    foreach (DataRow dr in ds.Tables[0].Rows)
                    {
                        listInstitute.Add(new InstituteListEntity
                        {
                            InstituteID = Convert.ToInt64(dr["CollegeID"]),
                            InstituteCode = Convert.ToString(dr["CollegeRegistrationNo"]),
                            InstituteName = Convert.ToString(dr["CollegeName"]),
                            RegionID = Convert.ToInt16(dr["RegionID"]),
                            Region = Convert.ToString(dr["Region"]),
                            DistrictID = Convert.ToInt32(dr["DistrictID"]),
                            District = Convert.ToString(dr["District"]),
                            TalukaID = Convert.ToInt32(dr["TalukaID"]),
                            Taluka = Convert.ToString(dr["Taluka"]),
                           // ChoiceCode = Convert.ToInt64(dr["ChoiceCode"]),
                            CourseID = Convert.ToInt32(dr["CourseID"]),
                            CourseCode = Convert.ToString(dr["CourseCode"]),
                            Course = Convert.ToString(dr["CourseName"]),
                            ShiftID = Convert.ToInt16(dr["ShiftID"]),
                            Shift = Convert.ToString(dr["Shift"]),
                            SectorID = Convert.ToInt16(dr["SectorID"]),
                            Sector = Convert.ToString(dr["Sector"]),
                            CourseTypeID = Convert.ToInt16(dr["CourseTypeID"]),
                            CourseType = Convert.ToString(dr["CourseType"]),
                            EntryQualificationID = Convert.ToInt16(dr["EntryQualificationID"]),
                            EntryQualification = Convert.ToString(dr["EntryQualification"]),
                            AffiliationValidity = Convert.ToString(dr["AffiliationValidity"]),
                            NoOfUnit = Convert.ToInt16(dr["NoOfUnit"]),
                            TotalIntake = Convert.ToInt16(dr["TotalIntake"]),
                            CurrentVacancy = Convert.ToInt16(dr["CurrentVacancy"]),
                            FullTimePartTime = Convert.ToString(dr["FullTimePartTime"])
                        });
                    }
                }
            }
            catch (Exception)
            {
                throw;
            }
            return listInstitute;
        }

        public string DeleteAppliedCourse(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            try
            {
                string retVal = _repository.DeleteAppliedCourse(entity);
                return retVal.ToUpper() == "N" ? "Data has not been saved. Please try again." : retVal;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteAppliedCourse", entity.CandidateID.ToString());
                return ex.Message;
            }
        }

        public string DeleteAppliedCourseByCandidateID(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity));

            try
            {
                string retVal = _repository.DeleteAppliedCourseByCandidateID(entity);
                return retVal.ToUpper() == "N" ? "Data has not been saved. Please try again." : retVal;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteAppliedCourseByCandidateID", entity.CandidateID.ToString());
                return ex.Message;
            }
        }

        public DataSet GetApplyForAdmissionEligiblity(long CandidateID, string UserLoginID)
        {
            try
            {
                return _repository.GetApplyForAdmissionEligiblity(CandidateID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetApplyForAdmissionEligiblity", CandidateID.ToString());
                throw;
            }
        }
    }
}
