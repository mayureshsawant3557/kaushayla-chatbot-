using Portal.Entities;
using Portal.Entities.Staff;
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
        public DataTable GetStaffBank(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_GetBank", param);
        }
        public string SaveStaffBank(StaffBankEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
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

            return _dbAccess.ExecuteScalar("Staff_SaveBank", param).ToString();
        }
    }
}
