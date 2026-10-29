using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffBank
    {
        StaffBankEntity GetStaffBank(StaffInput entity);
        string SaveStaffBank(StaffBankEntity entity);
    }
}
