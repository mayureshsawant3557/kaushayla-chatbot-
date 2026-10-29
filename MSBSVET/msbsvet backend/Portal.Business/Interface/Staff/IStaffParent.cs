using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffParent
    {
        StaffParentEntity GetStaffParent(StaffInput entity);
        string SaveStaffParent(StaffParentEntity entity);
    }
}
