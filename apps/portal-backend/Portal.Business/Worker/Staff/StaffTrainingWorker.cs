using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Staff
{
    public class StaffTrainingWorker : IStaffTraining
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffTrainingWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public List<StaffTrainingEntity> GetStaffTrainingList(long StaffID)
        {
            List<StaffTrainingEntity> list = new List<StaffTrainingEntity>();
            try
            {
                DataTable dt = objData.GetStaffTrainingList(StaffID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    StaffTrainingEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new StaffTrainingEntity();

                        obj.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                        obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                        obj.Course = Convert.ToString(dr["Course"]);
                        obj.CourseConductedBy = Convert.ToString(dr["CourseConductedBy"]);
                        obj.FromDate = Convert.ToDateTime(dr["FromDate"]);
                        obj.FromDateStr = Convert.ToString(dr["FromDateStr"]);
                        obj.ToDate = Convert.ToDateTime(dr["ToDate"]);
                        obj.ToDateStr = Convert.ToString(dr["ToDateStr"]);
                        obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);
                        obj.IsTraningAvailable = Convert.ToString(dr["IsTraningAvailable"]);

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffTrainingList", StaffID.ToString());
                throw ex;
            }
            return list;
        }
        public StaffTrainingEntity GetStaffTraining(long TrainingRowID)
        {
            StaffTrainingEntity obj = new StaffTrainingEntity();
            try
            {
                DataTable dt = objData.GetStaffTraining(TrainingRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.Course = Convert.ToString(dr["Course"]);
                    obj.CourseConductedBy = Convert.ToString(dr["CourseConductedBy"]);
                    obj.FromDate = Convert.ToDateTime(dr["FromDate"]);
                    obj.ToDate = Convert.ToDateTime(dr["ToDate"]);
                    obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);
                    obj.IsTraningAvailable = Convert.ToString(dr["IsTraningAvailable"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffTraining", TrainingRowID.ToString());
                throw ex;
            }
            return obj;
        }
        public string DeleteStaffTraining(StaffTrainingEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteStaffTraining(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteStaffTraining", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveStaffTraining(StaffTrainingEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffTraining(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffTraining", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
