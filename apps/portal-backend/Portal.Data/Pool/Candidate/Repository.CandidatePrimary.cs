using Portal.Data.Source;
using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
       

       

        public DataTable GetCandidatePrimary(CandidateInput entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "Candidate input cannot be null.");
            }

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID ?? (object)DBNull.Value },
                { "@PageCode", entity.PageCode ?? (object)DBNull.Value }
            };

            return _dbAccess.GetDataTable("Candidate_GetPrimary", param);
        }

        public string SaveCandidatePrimary(CandidatePrimaryEntity entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "Candidate primary entity cannot be null.");
            }

            var param = new Dictionary<string, object>
            {
               { "@CandidateID", entity.CandidateID },
                { "@FirstName", entity.FirstName ?? (object)DBNull.Value },
                { "@MiddleName", entity.MiddleName ?? (object)DBNull.Value },
                { "@LastName", entity.LastName ?? (object)DBNull.Value },
                { "@PhotoFilePath", entity.PhotoFilePath ?? (object)DBNull.Value },
                { "@SignFilePath", entity.SignFilePath ?? (object)DBNull.Value },
                { "@GenderCode", entity.GenderCode ?? (object)DBNull.Value },
                { "@DOB", entity.DOB },
                { "@DOBFilePath", entity.DOBFilePath ?? (object)DBNull.Value },
                { "@AadhaarNo", entity.AadhaarNo ?? (object)DBNull.Value },
                { "@AadhaarFilePath", entity.AadhaarFilePath ?? (object)DBNull.Value },
                { "@MobileNo", entity.MobileNo ?? (object)DBNull.Value },
                { "@AltMobileNo", entity.AltMobileNo ?? (object)DBNull.Value },
                { "@EMailID", entity.EMailID ?? (object)DBNull.Value },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value },
                { "@PageCode", entity.PageCode ?? (object)DBNull.Value },
                {"@IsAadhaarVerified", entity.IsAadhaarVerified  },
                {"@IsForReverification", entity.IsForReverification }
            };

            object result = _dbAccess.ExecuteScalar("Candidate_SavePrimary", param);
            return result?.ToString() ?? "N"; // Handle null response safely
        }

        public DataTable IsAadharNoDuplicate(string AadharNo, long CandidateID)
        {
            if (string.IsNullOrEmpty(AadharNo))
            {
                throw new ArgumentNullException(nameof(AadharNo), "Aadhaar number cannot be null or empty.");
            }

            var param = new Dictionary<string, object>
            {
                { "@AadharNo", AadharNo },
                { "@CandidateID", CandidateID }
            };

            return _dbAccess.GetDataTable("Candidate_IsAadharNoDuplicate", param);
        }

        public string UpdateAadharNo(string AadhaarNo, CandidateInput entity, string AadhaarFilePath)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "Candidate input cannot be null.");
            }
            if (string.IsNullOrEmpty(AadhaarNo))
            {
                throw new ArgumentNullException(nameof(AadhaarNo), "Aadhaar number cannot be null or empty.");
            }

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@AadhaarNo", AadhaarNo },
                { "@AadhaarFilePath", AadhaarFilePath ?? (object)DBNull.Value },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress ?? (object)DBNull.Value }
            };

            object result = _dbAccess.ExecuteScalar("Candidate_UpdateAadhaarNo", param);
            return result?.ToString() ?? "N"; // Handle null response safely
        }
        public DataTable GetCandidateDashboard(long CandidateID)
        {
            var param = new Dictionary<string, object>
            {
                { "@CandidateID", CandidateID }
            };

            return _dbAccess.GetDataTable("Dashboard_GetCandidateDashboard", param);
        }
    }
}
