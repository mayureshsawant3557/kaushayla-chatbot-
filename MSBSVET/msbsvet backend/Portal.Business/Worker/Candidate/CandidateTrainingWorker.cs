using Portal.Entities;
using Portal.Entities.Candidate;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Data;


namespace Portal.Business.Worker.Candidate
{
    public class CandidateTrainingWorker : ICandidateTraining
    {
        private readonly Repository _objData; // Injected Repository instance

        // ✅ Constructor Dependency Injection
        public CandidateTrainingWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public List<CandidateTrainingEntity> GetCandidateTrainingList(long CandidateID)
        {
            List<CandidateTrainingEntity> list = new List<CandidateTrainingEntity>();
            try
            {
                DataTable dt = _objData.GetCandidateTrainingList(CandidateID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    CandidateTrainingEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new CandidateTrainingEntity();

                        obj.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                        obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
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
                CommonHelper.SaveException(ex.Message, "GetCandidateTrainingList", CandidateID.ToString());
                throw ex;
            }
            return list;
        }

        public CandidateTrainingEntity GetCandidateTraining(long TrainingRowID)
        {
            CandidateTrainingEntity obj = new CandidateTrainingEntity();
            try
            {
                DataTable dt = _objData.GetCandidateTraining(TrainingRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.TrainingRowID = Convert.ToInt64(dr["TrainingRowID"]);
                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
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
                CommonHelper.SaveException(ex.Message, "GetCandidateTraining", TrainingRowID.ToString());
                throw ex;
            }
            return obj;
        }

        public string DeleteCandidateTraining(CandidateTrainingEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.DeleteCandidateTraining(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCandidateTraining", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveCandidateTraining(CandidateTrainingEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveCandidateTraining(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateTraining", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
