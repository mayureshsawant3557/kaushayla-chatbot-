using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateApplyMainCourseWorker : ICandidateApplyMainCourse
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to prevent NullReferenceException
        public CandidateApplyMainCourseWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null.");
        }

        public List<MainCourseApplyEntity> GetAppliedMainCourse(long candidateId)
        {
            if (candidateId <= 0)
                throw new ArgumentException("Invalid Candidate ID.", nameof(candidateId));

            List<MainCourseApplyEntity> appliedCourses = new List<MainCourseApplyEntity>();

            try
            {
                DataTable dt = _objData.GetAppliedMainCourse(candidateId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        appliedCourses.Add(new MainCourseApplyEntity
                        {
                            CandidateID = DBNull.Value.Equals(dr["CandidateID"]) ? 0 : Convert.ToInt64(dr["CandidateID"]),
                            ApplicationID = DBNull.Value.Equals(dr["ApplicationID"]) ? 0 : Convert.ToInt64(dr["ApplicationID"]),
                            ApplicationIDDisplay = dr["ApplicationIDDisplay"]?.ToString(),
                            MainCourseID = DBNull.Value.Equals(dr["MainCourseID"]) ? (short)0 : Convert.ToInt16(dr["MainCourseID"]),
                            AdmissionYearID = DBNull.Value.Equals(dr["AdmissionYearID"]) ? (short)0 : Convert.ToInt16(dr["AdmissionYearID"]),
                            PaymentStatus = dr["PaymentStatus"]?.ToString(),
                            PaymentDate = dr["PaymentDate"]?.ToString() == "01-01-1900 00:00:00" ? "-" : dr["PaymentDate"]?.ToString(),
                            LastModifiedOn = dr["LastModifiedOn"]?.ToString(),
                            ProfileID = dr["ProfileID"]?.ToString(),
                            MainCourseName = dr["MainCourseName"]?.ToString(),
                            IsUnlock = DBNull.Value.Equals(dr["IsUnlock"]) ? (short)0 : Convert.ToInt16(dr["IsUnlock"]),
                            IsLock = DBNull.Value.Equals(dr["IsLock"]) ? (short)0 : Convert.ToInt16(dr["IsLock"]),
                            IsApplied = DBNull.Value.Equals(dr["IsApplied"]) ? (short)0 : Convert.ToInt16(dr["IsApplied"]),
                            IsFeePaid = DBNull.Value.Equals(dr["IsFeePaid"]) ? (short)0 : Convert.ToInt16(dr["IsFeePaid"]),
                            IsAdmittd = DBNull.Value.Equals(dr["IsAdmittd"]) ? (short)0 : Convert.ToInt16(dr["IsAdmittd"]),
                            AmountPaid = dr["AmountPaid"]?.ToString(),
                            IsExpire = DBNull.Value.Equals(dr["IsExpire"]) ? (short)0 : Convert.ToInt16(dr["IsExpire"]),
                            ReportingStatus = dr["ReportingStatus"]?.ToString(),
                            ResponseUrl = dr["ResponseUrl"]?.ToString(),
                            OptionsLink = dr["OptionsLink"]?.ToString(),
                            //CourseNameCode = dr["CourseNameCode"]?.ToString(),
                            //InstituteNameCode = dr["InstituteNameCode"]?.ToString(),
                            //Result = dr["Result"].ToString()
                            //IsSTT = DBNull.Value.Equals(dr["IsSTT"]) ? (short)0 : Convert.ToInt16(dr["IsSTT"])

                        });
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.ToString(), "GetAppliedMainCourse", candidateId.ToString());
                throw;
            }

            return appliedCourses;
        }

        public string SaveAppliedMainCourse(MainCourseApplyEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "MainCourseApplyEntity cannot be null.");

            try
            {
                string result = _objData.SaveAppliedMainCourse(entity);
                return result.Equals("N", StringComparison.OrdinalIgnoreCase)
                    ? "Data has not been saved. Please try again."
                    : result;
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.ToString(), "SaveAppliedMainCourse", entity.UserLoginID);
                throw;
            }
        }
        public Int16 GetMainCourseAppliedFor(Int64 ApplicationID)
        {
            Int16 retVal = 0;
            try
            {
                retVal = _objData.GetMainCourseAppliedFor(ApplicationID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMainCourseAppliedFor", ApplicationID.ToString());
                throw ex;
            }
            return retVal;
        }
    }
}
