using Portal.Entities.RO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.RO
{
    public interface IROBase

    {
        List<ROManagementDetailsEntity> GetROManagementDetails(long roID);

        string SaveROManagementDetails(ROManagementDetailsEntity entity);

        DataTable RO_GetRo_ManagementTypeByRoID(long ROID, int managementType);

    }
}
