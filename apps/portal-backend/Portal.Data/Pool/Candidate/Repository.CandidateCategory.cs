using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateCategory(CandidateInput entity)
        {
            // Check for null reference
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.GetDataTable("Candidate_GetCategory", param);
        }

        public string SaveCandidateCategory(CandidateCategoryEntity entity)
        {
            // Check for null reference
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateCategoryEntity cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@NationalityID", entity.NationalityID },
                { "@LeavingCertificatePath", entity.LeavingCertificatePath },
                { "@IsMHDomiciled", entity.IsMHDomiciled },
                { "@DomicileCertificatePath", entity.DomicileCertificatePath },
                { "@ReligionID", entity.ReligionID },
                { "@CategoryID", entity.CategoryID },
                { "@CasteID", entity.CasteID },
                { "@CasteCertificatePath", entity.CasteCertificatePath },
                { "@IsBelongToNCL", entity.IsBelongToNCL },
                { "@NCLCertificatePath", entity.NCLCertificatePath },
                { "@IsBelongToPWD", entity.IsBelongToPWD },
                { "@DisabilityPercentage", entity.DisabilityPercentage },
                { "@DisabilityID", entity.DisabilityID },
                { "@DisabilityType", entity.DisabilityType },
                { "@UniqueDisabilityIDNo", entity.UniqueDisabilityIDNo },
                { "@PWDCertificatePath", entity.PWDCertificatePath },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

            // Use null-conditional operator in case ExecuteScalar returns null
            return _dbAccess.ExecuteScalar("Candidate_SaveCategory", param)?.ToString();
        }
    }
}
