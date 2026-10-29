
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateAdditional
    {
        CandidateAdditionalEntity GetCandidateAdditional(CandidateInput entity);
        string SaveCandidateAdditional(CandidateAdditionalEntity entity);

        List<CandidateLanguageEntity> GetCandidateLanguageList(long CandidateID);
        CandidateLanguageEntity GetCandidateLanguage(long LanguageRowID);
        string DeleteCandidateLanguage(CandidateLanguageEntity entity);
        string SaveCandidateLanguage(CandidateLanguageEntity entity);
    }
}
