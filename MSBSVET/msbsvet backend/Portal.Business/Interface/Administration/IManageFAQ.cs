
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;

namespace Portal.Business
{
    public interface IManageFAQ
    {
        DataTable GetFAQListForDisplay(Int16 RegionID, string Language);
        DataTable GetFAQList(Int16 RegionID);
        FAQEntity GetFAQDetails(Int32 FAQID);
        string SaveFAQ(FAQEntity entity);
        string SaveFAQSeqNo(List<FAQEntity> ListEntity);
        string DeleteFAQ(Int32 FAQID, string UserLoginID, string IPAddress);
    }
}
