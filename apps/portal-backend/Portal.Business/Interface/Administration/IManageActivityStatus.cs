using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Administration
{
    public interface IManageActivityStatus
    {
        DataTable GetActivityStatusList(Int16 RegionID);
        DataSet GetActivityStatusDetails(Int16 RegionID, string ActivityName);
        string SaveActivityStatusDetails(Int16 RegionID, string ActivityName, DateTime? ActivityStartDateTime, DateTime? ActivityEndDateTime, string ModifiedBy, string ModifiedByIPAddress);
    }
}
