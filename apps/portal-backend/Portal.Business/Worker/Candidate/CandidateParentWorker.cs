using Portal.Business;
using Portal.Data;
using Portal.Entities;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Candidate;
using System;
using System.Data;

namespace Portal.Business.Worker.Candidate
{
    public class CandidateParentWorker : ICandidateParent
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to avoid directly instantiating Repository
        public CandidateParentWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public CandidateParentEntity GetCandidateParent(CandidateInput entity)
        {
            CandidateParentEntity obj = new CandidateParentEntity();
            try
            {
                DataTable dt = _objData.GetCandidateParent(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.CandidateID = Convert.ToInt64(dr["CandidateID"]);
                    obj.IsOrphan = Convert.ToInt16(dr["IsOrphan"]);
                    obj.FatherFirstName = Convert.ToString(dr["FatherFirstName"]);
                    obj.FatherMiddleName = Convert.ToString(dr["FatherMiddleName"]);
                    obj.FatherLastName = Convert.ToString(dr["FatherLastName"]);
                    obj.MotherFirstName = Convert.ToString(dr["MotherFirstName"]);
                    obj.MotherMiddleName = Convert.ToString(dr["MotherMiddleName"]);
                    obj.MotherLastName = Convert.ToString(dr["MotherLastName"]);
                    obj.MaritalStatus = Convert.ToString(dr["MaritalStatus"]);
                    obj.SpouseTitle = Convert.ToString(dr["SpouseTitle"]);
                    obj.SpouseFirstName = Convert.ToString(dr["SpouseFirstName"]);
                    obj.SpouseMiddleName = Convert.ToString(dr["SpouseMiddleName"]);
                    obj.SpouseLastName = Convert.ToString(dr["SpouseLastName"]);
                    obj.FatherTitle = Convert.ToString(dr["FatherTitle"]);
                    obj.MotherTitle = Convert.ToString(dr["MotherTitle"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateParent", entity.UserLoginID);
                throw;
            }
            return obj;
        }

        public string SaveCandidateParent(CandidateParentEntity entity)
        {
            string retVal = string.Empty;
            try
            {
                retVal = _objData.SaveCandidateParent(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveCandidateParent", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
