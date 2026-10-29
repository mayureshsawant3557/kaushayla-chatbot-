using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateAddress(CandidateInput entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.GetDataTable("Candidate_GetAddress", param);
        }

        public string SaveCandidateAddress(CandidateAddressEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateAddressEntity cannot be null");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@PAddress", entity.PAddress ?? string.Empty },
                { "@PStateID", entity.PStateID },
                { "@PDistrictID", entity.PDistrictID },
                { "@PTalukaID", entity.PTalukaID },
                { "@PCityID", entity.PCityID },
                { "@POtherCity", entity.POtherCity ?? string.Empty },
                { "@PPincode", entity.PPincode ?? string.Empty },
                { "@IsPPincodeCorrect", entity.IsPPincodeCorrect },
                { "@IsCAddressSameAsPAddress", entity.IsCAddressSameAsPAddress },
                { "@CAddress", entity.CAddress ?? string.Empty },
                { "@CStateID", entity.CStateID },
                { "@CDistrictID", entity.CDistrictID },
                { "@CTalukaID", entity.CTalukaID },
                { "@CCityID", entity.CCityID },
                { "@COtherCity", entity.COtherCity ?? string.Empty },
                { "@CPincode", entity.CPincode ?? string.Empty },
                { "@IsCPincodeCorrect", entity.IsCPincodeCorrect },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress ?? string.Empty },
                { "@PageCode", entity.PageCode ?? string.Empty }
            };

            var result = _dbAccess.ExecuteScalar("Candidate_SaveAddress", param);
            return result?.ToString() ?? "Operation failed.";
        }
    }
}
