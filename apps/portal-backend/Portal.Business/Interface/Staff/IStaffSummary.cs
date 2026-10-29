using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffSummary
    {
        CheckURLEntity CheckStaffURL(StaffInput entity);
        StaffSummaryEntity GetStaffSummary(StaffInput entity);
        string LockStaffForm(StaffFormLockEntity entity);
        string UnlockStaffForm(StaffFormUnlockEntity entity);
        DataTable GetEligibilityFlagForUnlockStaffForm(long StaffID, string UserLoginID);

    }
}
