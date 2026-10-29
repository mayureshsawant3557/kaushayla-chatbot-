
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateParent
    {
        CandidateParentEntity GetCandidateParent(CandidateInput entity);
        string SaveCandidateParent(CandidateParentEntity entity);
    }
}
