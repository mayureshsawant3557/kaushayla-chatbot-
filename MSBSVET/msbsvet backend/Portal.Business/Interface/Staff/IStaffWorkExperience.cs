using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffWorkExperience
    {
        List<StaffWorkExperienceEntity> GetStaffWorkExperienceList(long StaffID);
        StaffWorkExperienceEntity GetStaffWorkExperience(long WorkExperienceRowID);
        string DeleteStaffWorkExperience(StaffWorkExperienceEntity entity);
        string SaveStaffWorkExperience(StaffWorkExperienceEntity entity);
        string SaveSectorialExpertise(List<SectorialExpertiseEntity> entity, long StaffID, string UserLoginID, string IPAddress);
        List<SectorialExpertiseEntity> GetStaffSectorialExpertiseList(long StaffID);

    }
}
