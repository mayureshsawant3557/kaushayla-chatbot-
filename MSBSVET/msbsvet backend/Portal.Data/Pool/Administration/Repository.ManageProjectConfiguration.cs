using Portal.Entities;
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
        public DataTable GetProjectConfigurationList(Int16 RegionID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);

            return _dbAccess.GetDataTable("Administration_GetProjectConfigurationList", param);
        }
        public DataSet GetProjectConfigurationDetails(Int16 RegionID, string AppKey)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@AppKey", AppKey);

            return _dbAccess.GetDataSet("Administration_GetProjectConfigurationDetails", param);
        }
        public string SaveProjectConfigurationDetails(Int16 RegionID, string AppKey, string AppValue, string ModifiedBy, string ModifiedByIPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@AppKey", AppKey);
            param.Add("@AppValue", AppValue);
            param.Add("@ModifiedBy", ModifiedBy);
            param.Add("@ModifiedByIPAddress", ModifiedByIPAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveProjectConfigurationDetails", param).ToString();
        }
    }
}
