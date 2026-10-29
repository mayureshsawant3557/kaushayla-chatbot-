using Portal.Entities;
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
        public DataTable GetFAQListForDisplay(Int16 RegionID, string Language)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@Language", Language);

            return _dbAccess.GetDataTable("Administration_GetFAQListForDisplay", param);
        }
        public DataTable GetFAQList(Int16 RegionID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);

            return _dbAccess.GetDataTable("Administration_GetFAQList", param);
        }
        public DataTable GetFAQDetails(Int32 FAQID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FAQID", FAQID);

            return _dbAccess.GetDataTable("Administration_GetFAQDetails", param);
        }
        public string SaveFAQ(FAQEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FAQID", entity.FAQID);
            param.Add("@FAQCategoryID", entity.FAQCategoryID);
            param.Add("@Question", entity.Question);
            param.Add("@QuestionMarathi", entity.QuestionMarathi);
            param.Add("@Answer", entity.Answer);
            param.Add("@AnswerMarathi", entity.AnswerMarathi);
            param.Add("@RegionID", entity.RegionID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveFAQ", param).ToString();
        }
        public string SaveFAQSeqNo(List<FAQEntity> ListEntity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FAQXML", GetXML(ListEntity));

            return _dbAccess.ExecuteScalar("Administration_SaveFAQSeqNo", param).ToString();
        }
        public string DeleteFAQ(Int32 FAQID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FAQID", FAQID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Administration_DeleteFAQ", param).ToString();
        }
    }
}
