using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateQualificationWorker : ICandidateQualification
    {
        private readonly Repository _objData; // ✅ Injected Repository

        // Constructor accepting Repository via Dependency Injection
        public CandidateQualificationWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public List<CandidateQualificationEntity> GetCandidateQualificationList(long CandidateID)
        {
            List<CandidateQualificationEntity> list = new List<CandidateQualificationEntity>();
            try
            {
                DataTable dt = _objData.GetCandidateQualificationList(CandidateID); // ✅ Use _objData (injected)

                if (dt != null && dt.Rows.Count > 0)
                {
                    CandidateQualificationEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new CandidateQualificationEntity();

                        obj.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                        obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                        obj.QualificationID = Convert.ToInt16(dr["QualificationID"]);
                        obj.Qualification = Convert.ToString(dr["Qualification"]);
                        obj.QualificationGroup = Convert.ToString(dr["QualificationGroup"]);
                        obj.Degree = Convert.ToString(dr["Degree"]);
                        obj.Subject = Convert.ToString(dr["Subject"]);
                        obj.University = Convert.ToString(dr["University"]);
                        obj.ResultDate = Convert.ToDateTime(dr["ResultDate"]);
                        obj.ResultDateStr = Convert.ToString(dr["ResultDateStr"]);
                        obj.AppearingYearsStr = dr["AppearingYear"].ToString();
                        obj.Attempts = Convert.ToInt16(dr["Attempts"]);
                        obj.MarksObtainedStr = dr["MarksObtained"].ToString();
                        obj.MaximumMarksStr = dr["MaximumMarks"].ToString();
                        obj.CourseDuration = Convert.ToInt16(dr["CourseDuration"]);
                        obj.Class = Convert.ToString(dr["Class"]);
                        obj.Mode = Convert.ToString(dr["Mode"]);
                        obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateQualificationList", CandidateID.ToString());
                throw ex;
            }
            return list;
        }

        public CandidateQualificationEntity GetCandidateQualification(long QualificationRowID)
        {
            CandidateQualificationEntity obj = new CandidateQualificationEntity();
            try
            {
                DataTable dt = _objData.GetCandidateQualification(QualificationRowID); // ✅ Use _objData (injected)

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.QualificationRowID = Convert.ToInt64(dr["QualificationRowID"]);
                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.QualificationID = Convert.ToInt16(dr["QualificationID"]);
                    obj.QualificationGroup = Convert.ToString(dr["QualificationGroup"]);
                    obj.Degree = Convert.ToString(dr["Degree"]);
                    obj.Subject = Convert.ToString(dr["Subject"]);
                    obj.University = Convert.ToString(dr["University"]);
                    obj.ResultDate = Convert.ToDateTime(dr["ResultDate"]);
                    obj.AppearingYear = Convert.ToInt16(dr["AppearingYear"]);
                    obj.Attempts = Convert.ToInt16(dr["Attempts"]);
                    obj.MarksObtained = Convert.ToInt32(dr["MarksObtained"]);
                    obj.MaximumMarks = Convert.ToInt32(dr["MaximumMarks"]);
                    obj.CourseDuration = Convert.ToInt16(dr["CourseDuration"]);
                    obj.Class = Convert.ToString(dr["Class"]);
                    obj.Mode = Convert.ToString(dr["Mode"]);
                    obj.CertificatePath = Convert.ToString(dr["CertificatePath"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateQualification", QualificationRowID.ToString());
                throw ex;
            }
            return obj;
        }

        public string DeleteCandidateQualification(CandidateQualificationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.DeleteCandidateQualification(entity); // ✅ Use _objData (injected)
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteCandidateQualification", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public string SaveCandidateQualification(CandidateQualificationEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveCandidateQualification(entity); // ✅ Use _objData (injected)
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateQualification", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
