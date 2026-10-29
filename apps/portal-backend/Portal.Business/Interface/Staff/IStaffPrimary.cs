using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffPrimary
    {
        StaffPrimaryEntity GetStaffPrimary(StaffInput entity);
        string SaveStaffPrimary(StaffPrimaryEntity entity);
        DataTable GetStaffDashboard(long StaffID);
    }
}
