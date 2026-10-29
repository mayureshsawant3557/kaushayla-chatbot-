using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Administration
{ 
    public interface IManageProjectConfiguration
    {
        DataTable GetProjectConfigurationList(Int16 RegionID);
        DataSet GetProjectConfigurationDetails(Int16 RegionID, string AppKey);
        string SaveProjectConfigurationDetails(Int16 RegionID, string AppKey, string AppValue, string ModifiedBy, string ModifiedByIPAddress);
    }
}
