
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateCategory
    {
        CandidateCategoryEntity GetCandidateCategory(CandidateInput entity);
        string SaveCandidateCategory(CandidateCategoryEntity entity);
    }
}
