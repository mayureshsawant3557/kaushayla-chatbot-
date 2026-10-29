
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateBank
    {
        CandidateBankEntity GetCandidateBank(CandidateInput entity);
        string SaveCandidateBank(CandidateBankEntity entity);
    }
}
