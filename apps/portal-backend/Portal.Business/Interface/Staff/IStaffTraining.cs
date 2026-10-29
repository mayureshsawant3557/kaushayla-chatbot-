using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Staff
{
    public interface IStaffTraining
    {
        List<StaffTrainingEntity> GetStaffTrainingList(long StaffID);
        StaffTrainingEntity GetStaffTraining(long TrainingRowID);
        string DeleteStaffTraining(StaffTrainingEntity entity);
        string SaveStaffTraining(StaffTrainingEntity entity);
    }
}
