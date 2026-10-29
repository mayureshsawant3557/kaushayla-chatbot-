using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffAdditional
    {
        StaffAdditionalEntity GetStaffAdditional(StaffInput entity);
        string SaveStaffAdditional(StaffAdditionalEntity entity);

        List<StaffLanguageEntity> GetStaffLanguageList(long StaffID);
        StaffLanguageEntity GetStaffLanguage(long LanguageRowID);
        string DeleteStaffLanguage(StaffLanguageEntity entity);
        string SaveStaffLanguage(StaffLanguageEntity entity);
    }
}
