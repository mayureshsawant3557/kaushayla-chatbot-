using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateTraining
    {
        List<CandidateTrainingEntity> GetCandidateTrainingList(long CandidateID);
        CandidateTrainingEntity GetCandidateTraining(long TrainingRowID);
        string DeleteCandidateTraining(CandidateTrainingEntity entity);
        string SaveCandidateTraining(CandidateTrainingEntity entity);
    }
}
