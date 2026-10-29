using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business
{
    public class ManageFAQWorker : IManageFAQ
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ManageFAQWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public DataTable GetFAQListForDisplay(Int16 RegionID, string Language)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetFAQListForDisplay(RegionID, Language);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFAQListForDisplay");
                throw ex;
            }
            return dt;
        }
        public DataTable GetFAQList(Int16 RegionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetFAQList(RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFAQList");
                throw ex;
            }
            return dt;
        }
        public FAQEntity GetFAQDetails(Int32 FAQID)
        {
            FAQEntity obj = new FAQEntity();
            try
            {
                DataTable dt = objData.GetFAQDetails(FAQID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.FAQID = Convert.ToInt32(dr["FAQID"]);
                    obj.FAQCategoryID = Convert.ToInt16(dr["FAQCategoryID"]);
                    obj.Question = Convert.ToString(dr["Question"]);
                    obj.QuestionMarathi = Convert.ToString(dr["QuestionMarathi"]);
                    obj.Answer = Convert.ToString(dr["Answer"]);
                    obj.AnswerMarathi = Convert.ToString(dr["AnswerMarathi"]);
                    obj.SeqNo = Convert.ToInt32(dr["SeqNo"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetFAQDetails");
                throw ex;
            }
            return obj;
        }
        public string SaveFAQ(FAQEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveFAQ(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFAQ");
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveFAQSeqNo(List<FAQEntity> ListEntity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveFAQSeqNo(ListEntity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveFAQSeqNo");
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteFAQ(Int32 FAQID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteFAQ(FAQID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteFAQ");
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
