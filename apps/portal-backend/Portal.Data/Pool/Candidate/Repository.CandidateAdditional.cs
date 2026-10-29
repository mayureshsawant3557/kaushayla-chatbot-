using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateAdditional(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.GetDataTable("Candidate_GetAdditional", param);
        }

        public string SaveCandidateAdditional(CandidateAdditionalEntity entity)
        {
            if (entity == null)
                return "Invalid input data.";

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@BloodGroupID", entity.BloodGroupID },
                { "@MotherTongueID", entity.MotherTongueID },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.ExecuteScalar("Candidate_SaveAdditional", param)?.ToString() ?? "Operation failed.";
        }

        public DataTable GetCandidateLanguageList(long CandidateID)
        {
            var param = new Dictionary<string, object> { { "@CandidateID", CandidateID } };
            return _dbAccess.GetDataTable("Candidate_GetLanguageList", param);
        }

        public DataTable GetCandidateLanguage(long LanguageRowID)
        {
            var param = new Dictionary<string, object> { { "@LanguageRowID", LanguageRowID } };
            return _dbAccess.GetDataTable("Candidate_GetLanguage", param);
        }

        public string DeleteCandidateLanguage(CandidateLanguageEntity entity)
        {
            if (entity == null)
                return "Invalid input data.";

            var param = new Dictionary<string, object>
            {
                { "@LanguageRowID", entity.LanguageRowID },
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.ExecuteScalar("Candidate_DeleteLanguage", param)?.ToString() ?? "Operation failed.";
        }

        public string SaveCandidateLanguage(CandidateLanguageEntity entity)
        {
            if (entity == null)
                return "Invalid input data.";

            var param = new Dictionary<string, object>
            {
                { "@LanguageRowID", entity.LanguageRowID },
                { "@CandidateID", entity.CandidateID },
                { "@LanguageID", entity.LanguageID },
                { "@Read", entity.Read },
                { "@Write", entity.Write },
                { "@Speak", entity.Speak },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.ExecuteScalar("Candidate_SaveLanguage", param)?.ToString() ?? "Operation failed.";
        }
    }
}
