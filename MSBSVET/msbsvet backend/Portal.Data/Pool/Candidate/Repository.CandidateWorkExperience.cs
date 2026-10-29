using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateWorkExperienceList(long CandidateID)
        {
            if (CandidateID <= 0)
                throw new ArgumentException("CandidateID must be greater than zero.", nameof(CandidateID));

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", CandidateID }
            };

            return _dbAccess.GetDataTable("Candidate_GetWorkExperienceList", param) ?? new DataTable();
        }

        public DataTable GetCandidateWorkExperience(long WorkExperienceRowID)
        {
            if (WorkExperienceRowID <= 0)
                throw new ArgumentException("WorkExperienceRowID must be greater than zero.", nameof(WorkExperienceRowID));

            var param = new Dictionary<string, object>
            {
                { "@WorkExperienceRowID", WorkExperienceRowID }
            };

            return _dbAccess.GetDataTable("Candidate_GetWorkExperience", param) ?? new DataTable();
        }

        public string DeleteCandidateWorkExperience(CandidateWorkExperienceEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Entity cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@WorkExperienceRowID", entity.WorkExperienceRowID },
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

            var result = _dbAccess.ExecuteScalar("Candidate_DeleteWorkExperience", param);
            return result?.ToString() ?? "Operation failed.";
        }

        public string SaveCandidateWorkExperience(CandidateWorkExperienceEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "Entity cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@WorkExperienceRowID", entity.WorkExperienceRowID },
                { "@CandidateID", entity.CandidateID },
                { "@EstablishmentName", entity.EstablishmentName ?? string.Empty },
                { "@FromDate", entity.FromDate },
                { "@ToDate", entity.ToDate },
                { "@SalaryPerMonth", entity.SalaryPerMonth },
                { "@JobRole", entity.JobRole ?? string.Empty },
                { "@Address", entity.Address ?? string.Empty },
                { "@StateID", entity.StateID },
                { "@DistrictID", entity.DistrictID },
                { "@TalukaID", entity.TalukaID },
                { "@CityID", entity.CityID },
                { "@OtherCity", entity.OtherCity ?? string.Empty },
                { "@Pincode", entity.Pincode ?? string.Empty },
                { "@IsPincodeCorrect", entity.IsPincodeCorrect },
                { "@UserLoginID", entity.UserLoginID ?? string.Empty },
                { "@IPAddress", entity.IPAddress ?? string.Empty },
                { "@PageCode", entity.PageCode ?? string.Empty },
                 { "@IsWorkExperience", entity.IsWorkExperience ?? (object)DBNull.Value }

            };

            var result = _dbAccess.ExecuteScalar("Candidate_SaveWorkExperience", param);
            return result?.ToString() ?? "Operation failed.";
        }
    }
}
