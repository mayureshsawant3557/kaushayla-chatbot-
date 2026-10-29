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
        public DataTable GetActivityStatusList(Int16 RegionID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);

            return _dbAccess.GetDataTable("Administration_GetActivityStatusList", param);
        }
        public DataSet GetActivityStatusDetails(Int16 RegionID, string ActivityName)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@ActivityName", ActivityName);

            return _dbAccess.GetDataSet("Administration_GetActivityStatusDetails", param);
        }
        public string SaveActivityStatusDetails(Int16 RegionID, string ActivityName, DateTime? ActivityStartDateTime, DateTime? ActivityEndDateTime, string ModifiedBy, string ModifiedByIPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@ActivityName", ActivityName);
            param.Add("@ActivityStartDateTime", ActivityStartDateTime);
            param.Add("@ActivityEndDateTime", ActivityEndDateTime);
            param.Add("@ModifiedBy", ModifiedBy);
            param.Add("@ModifiedByIPAddress", ModifiedByIPAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveActivityStatusDetails", param).ToString();
        }
    }
}
