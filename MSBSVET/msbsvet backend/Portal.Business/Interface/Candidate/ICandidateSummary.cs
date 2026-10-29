using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidateSummary
    {
        CheckURLEntity CheckCandidateURL(CandidateInput entity);
        CandidateSummaryEntity GetCandidateSummary(CandidateInput entity);
        string LockCandidateForm(CandidateFormLockEntity entity);
        string UnlockCandidateForm(CandidateFormUnlockEntity entity);
        DataTable GetEligibilityFlagForUnlockCandidateForm(long CandidateID, string UserLoginID);
        InstituteInfoEntity GetAppliedInstituteDetailsSummary(CandidateInput entity);

    }
}
