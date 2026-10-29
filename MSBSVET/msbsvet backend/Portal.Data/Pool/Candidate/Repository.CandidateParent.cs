using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetCandidateParent(CandidateInput entity)
        {
            // Check if the entity parameter is null
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateInput cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@UserLoginID", entity.UserLoginID },
                { "@PageCode", entity.PageCode }
            };

            return _dbAccess.GetDataTable("Candidate_GetParent", param);
        }

        public string SaveCandidateParent(CandidateParentEntity entity)
        {
            // Check if the entity parameter is null
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateParentEntity cannot be null.");

            var param = new Dictionary<string, object>
            {
                { "@CandidateID", entity.CandidateID },
                { "@IsOrphan", entity.IsOrphan },
                { "@FatherFirstName", entity.FatherFirstName },
                { "@FatherMiddleName", entity.FatherMiddleName },
                { "@FatherLastName", entity.FatherLastName },
                { "@MotherFirstName", entity.MotherFirstName },
                { "@MotherMiddleName", entity.MotherMiddleName },
                { "@MotherLastName", entity.MotherLastName },
                { "@MaritalStatus", entity.MaritalStatus },
                { "@SpouseTitle", entity.SpouseTitle },
                { "@SpouseFirstName", entity.SpouseFirstName },
                { "@SpouseMiddleName", entity.SpouseMiddleName },
                { "@SpouseLastName", entity.SpouseLastName },
                { "@FatherTitle", entity.FatherTitle },
                { "@MotherTitle", entity.MotherTitle },
                { "@UserLoginID", entity.UserLoginID },
                { "@IPAddress", entity.IPAddress },
                { "@PageCode", entity.PageCode }
            };

           
            return _dbAccess.ExecuteScalar("Candidate_SaveParent", param)?.ToString();
        }
    }
}
