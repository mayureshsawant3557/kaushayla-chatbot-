using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using System.Data;
using Portal.Entities.Staff;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable CheckStaffURL(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_CheckURL", param);
        }
        public DataSet GetStaffSummary(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataSet("Staff_GetSummary", param);
        }
        public string LockStaffForm(StaffFormLockEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_LockForm", param).ToString();
        }
        public string UnlockStaffForm(StaffFormUnlockEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_UnlockForm", param).ToString();
        }
        public DataTable GetEligibilityFlagForUnlockStaffForm(Int64 StaffID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataTable("Staff_GetEligibilityFlagForUnlockForm", param);
        }

        
	}
}
