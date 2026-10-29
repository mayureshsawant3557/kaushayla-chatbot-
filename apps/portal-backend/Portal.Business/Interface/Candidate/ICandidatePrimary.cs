
using iTextSharp.text.pdf;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Candidate
{
    public interface ICandidatePrimary
    {
        CandidatePrimaryEntity GetCandidatePrimary(CandidateInput entity);
        string SaveCandidatePrimary(CandidatePrimaryEntity entity);
        DataTable IsAadharNoDuplicate(string AadharNo, long CandidateID);
        string UpdateAadharNo(string AadhaarNo, CandidateInput entity, string AadhaarFilePath);

        DataTable GetCandidateDashboard(long CandidateID);
    }
}
