using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public string SaveAppliedMainCourse(MainCourseApplyEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "MainCourseApplyEntity cannot be null.");

            try
            {
                var param = new Dictionary<string, object>
                {
                    { "@CandidateID", entity.CandidateID },
                    { "@MainCourseID", entity.MainCourseID },
                    { "@AdmissionYearID", entity.AdmissionYearID },
                    { "@UserLoginID", entity.UserLoginID },
                    { "@IPAddress", entity.IPAddress ?? string.Empty },
                    { "@IsSTT", entity.IsSTT},
                     
                };  


                var result = _dbAccess.ExecuteScalar("Candidate_SaveAppliedMainCourse", param);
                return result?.ToString() ?? "Success";  
            }
            catch (Exception)
            {
                throw;  
            }
        }

        public DataTable GetAppliedMainCourse(long candidateId)
        {
            if (candidateId <= 0)
                throw new ArgumentException("Invalid Candidate ID.", nameof(candidateId));

            try
            {
                var param = new Dictionary<string, object>
                {
                    { "@CandidateID", candidateId }
                };

                return _dbAccess.GetDataTable("Candidate_GetAppliedMainCourse", param);
            }
            catch (Exception)
            {
                throw;  
            }
        }
        public Int16 GetMainCourseAppliedFor(Int64 ApplicationID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ApplicationID", ApplicationID);
            return Convert.ToInt16(_dbAccess.ExecuteScalar("Candidate_GetAppliedMainCourseStatus", param).ToString());
        }
    }
}
