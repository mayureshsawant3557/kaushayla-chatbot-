using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffQualification
    {
        List<StaffQualificationEntity> GetStaffQualificationList(long StaffID);
        StaffQualificationEntity GetStaffQualification(long QualificationRowID);
        string DeleteStaffQualification(StaffQualificationEntity entity);
        string SaveStaffQualification(StaffQualificationEntity entity);
    }
}
