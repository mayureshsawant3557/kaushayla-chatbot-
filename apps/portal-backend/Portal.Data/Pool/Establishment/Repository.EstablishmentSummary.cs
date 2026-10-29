using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using System.Data;
using Portal.Entities.Establishment;

namespace Portal.Data
{
   public partial class Repository
    {
        public DataTable CheckEstablishmentURL(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            
            return _dbAccess.GetDataTable("Establishment_CheckURL", param);
        }
        public DataSet GetEstablishmentSummary(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Establishment_GetSummary", param);
        }
        public string UnlockEstablishmentForm(EstablishmentFormUnlockEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_UnlockForm", param).ToString();
        }
        public DataTable GetEligibilityFlagForUnlockEstablishmentForm(Int64 EstablishmentID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataTable("Establishment_GetEligibilityFlagForUnlockForm", param);
        }
        public DataSet GetCurrentApprovalStatus(Int64 EstablishmentID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);

            return _dbAccess.GetDataSet("Establishment_GetCurrentApprovalStatus", param);
        }
        public string ResubmitEstablishmentFormForApproval(Int64 EstablishmentID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", EstablishmentID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Establishment_ResubmitFormForApproval", param).ToString();
        }
    }
}
