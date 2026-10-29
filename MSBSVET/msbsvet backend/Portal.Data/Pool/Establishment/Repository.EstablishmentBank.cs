using Portal.Entities;
using Portal.Entities.Establishment;
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
        public DataTable GetEstablishmentBank(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetBank", param);
        }

        public string SaveEstablishmentBank(EstablishmentBankEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@AccountType", entity.AccountType);
            param.Add("@IFSCCode", entity.IFSCCode);
            param.Add("@BankName", entity.BankName);
            param.Add("@BranchName", entity.BranchName);
            param.Add("@AccountNo", entity.AccountNo);
            param.Add("@CancelChequePath", entity.CancelChequePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveBank", param).ToString();
        }
    }
}
