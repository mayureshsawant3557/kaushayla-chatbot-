using Portal.Entities;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Net.Mime.MediaTypeNames;

namespace Portal.Data
{
    public partial class Repository
    {
       
        public string ApplyForCourse(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "CourseApplyEntity cannot be null");

            var param = new Dictionary<string, object>
            {
                {"@CandidateID", entity.CandidateID},
                {"@CourseID", entity.CourseID},
                {"@CollegeID", entity.CollegeID},
                {"@ApplicationID", entity.ApplicationID},
                {"@AdmissionYearID", entity.AdmissionYearID},
                {"@UserLoginID", entity.UserLoginID},
                {"@IPAddress", entity.IPAddress},
                {"@PageCode", entity.PageCode}
            };

            return _dbAccess.ExecuteScalar("Candidate_ApplyForCourse", param)?.ToString() ?? "";
        }

        public DataSet GetAppliedCourse(long CandidateID, long ApplicationID, short AdmissionYearID)
        {
            var param = new Dictionary<string, object>
            {
                {"@CandidateID", CandidateID},
                {"@ApplicationID", ApplicationID},
                {"@AdmissionYearID", AdmissionYearID}
            };

            return _dbAccess.GetDataSet("Candidate_GetAppliedCourse", param) ?? new DataSet();
        }

        public DataSet GetAppliedCourseByCandidateID(long CandidateID, long ApplicationID)
        {
            var param = new Dictionary<string, object>
            {
                {"@CandidateID", CandidateID},
                {"@ApplicationID", ApplicationID}
            };

            return _dbAccess.GetDataSet("Candidate_GetAppliedCourseByCandidateIDApplicationID", param) ?? new DataSet();
        }
        //public DataSet GetAppliedCourseByCandidateID(long CandidateID, long ApplicationID)
        //{
        //    try
        //    {
        //        Console.WriteLine($"Executing SP Candidate_GetAppliedCourseByCandidateIDApplicationID with CandidateID: {CandidateID}, ApplicationID: {ApplicationID}");

        //        var param = new Dictionary<string, object>
        //{
        //    {"@CandidateID", CandidateID},
        //    {"@ApplicationID", ApplicationID}
        //};

        //        var ds = _dbAccess.GetDataSet("Candidate_GetAppliedCourseByCandidateIDApplicationID", param);

        //        if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
        //        {
        //            Console.WriteLine("No data returned from database.");
        //        }
        //        else
        //        {
        //            Console.WriteLine($"Database returned {ds.Tables[0].Rows.Count} rows.");
        //        }

        //        return ds ?? new DataSet();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error executing GetAppliedCourseByCandidateID: {ex.Message}");
        //        throw;
        //    }
        //}

        public DataSet GetAppliedCourseByCandidateID(long CandidateID)
        {
            var param = new Dictionary<string, object>
            {   
                {"@CandidateID", CandidateID}
            };

            return _dbAccess.GetDataSet("Candidate_GetAppliedCourseByCandidateID", param) ?? new DataSet();
        }
        //public DataSet GetAppliedCourseByCandidateID(long CandidateID)
        //{
        //    try
        //    {
        //        Console.WriteLine($"Executing SP Candidate_GetAppliedCourseByCandidateID with CandidateID: {CandidateID}");

        //        var param = new Dictionary<string, object>
        //{
        //    {"@CandidateID", CandidateID}
        //};

        //        var ds = _dbAccess.GetDataSet("Candidate_GetAppliedCourseByCandidateID", param);

        //        if (ds == null || ds.Tables.Count == 0 || ds.Tables[0].Rows.Count == 0)
        //        {
        //            Console.WriteLine("No data returned from database.");
        //        }
        //        else
        //        {
        //            Console.WriteLine($"Database returned {ds.Tables[0].Rows.Count} rows.");
        //        }

        //        return ds ?? new DataSet();
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"Error executing GetAppliedCourseByCandidateID: {ex.Message}");
        //        throw;
        //    }
        //}


        public string DeleteAppliedCourse(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "CourseApplyEntity cannot be null");

            var param = new Dictionary<string, object>
            {
                {"@CandidateID", entity.CandidateID},
                {"@CourseID", entity.CourseID},
                {"@CollegeID", entity.CollegeID},
                {"@ApplicationID", entity.ApplicationID},
                {"@AdmissionYearID", entity.AdmissionYearID},
                {"@UserLoginID", entity.UserLoginID},
                {"@IPAddress", entity.IPAddress},
                {"@PageCode", entity.PageCode}
            };

            return _dbAccess.ExecuteScalar("Candidate_DeleteAppliedCourse", param)?.ToString() ?? "";
        }

        public DataSet GetApplyForAdmissionEligiblity(long CandidateID, string UserLoginID)
        {
            var param = new Dictionary<string, object>
            {
                {"@CandidateID", CandidateID},
                {"@UserLoginID", UserLoginID}
            };

            return _dbAccess.GetDataSet("Candidate_GetApplyForAdmissionEligiblity", param) ?? new DataSet();
        }

        public string DeleteAppliedCourseByCandidateID(CourseApplyEntity entity)
        {
            if (entity == null) throw new ArgumentNullException(nameof(entity), "CourseApplyEntity cannot be null");

            var param = new Dictionary<string, object>
            {
                {"@CandidateID", entity.CandidateID},
                {"@UserLoginID", entity.UserLoginID},
                {"@IPAddress", entity.IPAddress},
                {"@PageCode", entity.PageCode}
            };

            return _dbAccess.ExecuteScalar("Candidate_DeleteAppliedCourseByCandidateID", param)?.ToString() ?? "";
        }
    }
}
