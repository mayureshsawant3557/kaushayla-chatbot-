using Portal.Entities;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetStaffTrainingList(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return _dbAccess.GetDataTable("Staff_GetTrainingList", param);
        }
        public DataTable GetStaffTraining(Int64 TrainingRowID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", TrainingRowID);

            return _dbAccess.GetDataTable("Staff_GetTraining", param);
        }
        public string DeleteStaffTraining(StaffTrainingEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", entity.TrainingRowID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_DeleteTraining", param).ToString();
        }
        public string SaveStaffTraining(StaffTrainingEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TrainingRowID", entity.TrainingRowID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@Course", entity.Course);
            param.Add("@CourseConductedBy", entity.CourseConductedBy);
            param.Add("@FromDate", entity.FromDate);
            param.Add("@ToDate", entity.ToDate);
            param.Add("@CertificatePath", entity.CertificatePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);
            param.Add("IsTraningAvailable", entity.IsTraningAvailable);

            return _dbAccess.ExecuteScalar("Staff_SaveTraining", param).ToString();
        }
    }
}
