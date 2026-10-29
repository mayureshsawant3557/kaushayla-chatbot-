
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateQualification
    {
        List<CandidateQualificationEntity> GetCandidateQualificationList(long CandidateID);
        CandidateQualificationEntity GetCandidateQualification(long QualificationRowID);
        string DeleteCandidateQualification(CandidateQualificationEntity entity);
        string SaveCandidateQualification(CandidateQualificationEntity entity);
    }
}
