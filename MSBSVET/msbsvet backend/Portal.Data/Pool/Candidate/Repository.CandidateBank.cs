using Portal.Data.Source;
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

        public DataTable GetCandidateBank(CandidateInput entity)
        {
            if (entity == null)
            {
                throw new ArgumentNullException(nameof(entity), "Candidate input cannot be null");
            }

            // ✅ Convert the CandidateInput object to a parameter dictionary
            var param = new Dictionary<string, object>
    {
        { "@CandidateID", entity.CandidateID },
        { "@UserLoginID", entity.UserLoginID ?? (object)DBNull.Value }, // Handle nulls
        { "@PageCode", entity.PageCode ?? (object)DBNull.Value }
    };

            // ✅ Fetch data from database
            return _dbAccess.GetDataTable("Candidate_GetBank", param);
        }

        
        public string SaveCandidateBank(CandidateBankEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CandidateID", entity.CandidateID);
            param.Add("@AccountType", entity.AccountType);
            param.Add("@AccountNo", entity.AccountNo);
            param.Add("@AccountHolderName", entity.AccountHolderName);
            param.Add("@IFSCCode", entity.IFSCCode);
            param.Add("@BankName", entity.BankName);
            param.Add("@BranchName", entity.BranchName);
            param.Add("@CancelChequePath", entity.CancelChequePath);
            param.Add("@PANNo", entity.PANNo);
            param.Add("@PANPath", entity.PANPath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@IsBankAcount", entity.IsBankAcount);
            param.Add("@IsPANDetails", entity.IsPANDetails);

            return _dbAccess.ExecuteScalar("Candidate_SaveBank", param).ToString();
        }
    }
}
