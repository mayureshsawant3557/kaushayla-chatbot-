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
    public interface IStaffApproval
    {
        DataTable SearchStaffManagement(int DistrictID, int TalukaID, int RegionID, string FormStatus, string ProfileID);
        string SaveStaffPrimaryVerification(StaffPrimaryEntity entity);
    }
}
