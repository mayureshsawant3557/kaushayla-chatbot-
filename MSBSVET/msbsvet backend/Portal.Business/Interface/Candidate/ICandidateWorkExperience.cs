using Portal.Entities;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateWorkExperience
    {
        List<CandidateWorkExperienceEntity> GetCandidateWorkExperienceList(long CandidateID);
        CandidateWorkExperienceEntity GetCandidateWorkExperience(long WorkExperienceRowID);
        string DeleteCandidateWorkExperience(CandidateWorkExperienceEntity entity);
        string SaveCandidateWorkExperience(CandidateWorkExperienceEntity entity);
    }
}
