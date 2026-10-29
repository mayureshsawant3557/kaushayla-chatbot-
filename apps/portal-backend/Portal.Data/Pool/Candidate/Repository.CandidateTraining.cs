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
        public DataTable GetCandidateTrainingList(Int64 CandidateID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", CandidateID);

            return _dbAccess.GetDataTable("Candidate_GetTrainingList", param);
        }

        public DataTable GetCandidateTraining(Int64 TrainingRowID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", TrainingRowID);

            return _dbAccess.GetDataTable("Candidate_GetTraining", param);
        }

        public string DeleteCandidateTraining(CandidateTrainingEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateTrainingEntity cannot be null.");

            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", entity.TrainingRowID);
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Candidate_DeleteTraining", param).ToString();
        }

        public string SaveCandidateTraining(CandidateTrainingEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity), "CandidateTrainingEntity cannot be null.");

            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", entity.TrainingRowID);
            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@Course", entity.Course);
            param.Add("@CourseConductedBy", entity.CourseConductedBy);
            param.Add("@FromDate", entity.FromDate);
            param.Add("@ToDate", entity.ToDate);
            param.Add("@CertificatePath", entity.CertificatePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@IsTraningAvailable", entity.IsTraningAvailable);


            return _dbAccess.ExecuteScalar("Candidate_SaveTraining", param).ToString();
        }
    }
}
