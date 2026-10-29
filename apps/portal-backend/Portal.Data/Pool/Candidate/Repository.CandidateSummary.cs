using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using System.Data;
using Portal.Entities.Candidate;

namespace Portal.Data
{
    public partial class Repository
    {
        //private readonly IDbAccess dbAccess;

        // Constructor to initialize dbAccess
        //public Repository(IDbAccess dbAccess)
        //{
        //    this.dbAccess = dbAccess ?? throw new ArgumentNullException(nameof(dbAccess));
        //}

        public DataTable CheckCandidateURL(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Candidate_CheckURL", param);
        }

        public DataSet GetCandidateSummary(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Candidate_GetSummary", param);
        }

        public string LockCandidateForm(CandidateFormLockEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            object result = _dbAccess.ExecuteScalar("Candidate_LockForm", param);
            return result?.ToString() ?? string.Empty;
        }

        public string UnlockCandidateForm(CandidateFormUnlockEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            object result = _dbAccess.ExecuteScalar("Candidate_UnlockForm", param);
            return result?.ToString() ?? string.Empty;
        }

        public DataTable GetEligibilityFlagForUnlockCandidateForm(Int64 CandidateID, string UserLoginID)
        {
            if (string.IsNullOrEmpty(UserLoginID))
                throw new ArgumentNullException(nameof(UserLoginID));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", CandidateID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataTable("Candidate_GetEligibilityFlagForUnlockForm", param);
        }

        public DataSet GetAppliedInstituteDetailsSummary(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Candidate_GetAppliedInstituteDetailsSummary", param);
        }
    }
}