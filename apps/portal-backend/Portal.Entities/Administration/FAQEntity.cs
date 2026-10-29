using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class FAQEntity
    {
        public Int32 FAQID { get; set; }
        public Int16 FAQCategoryID { get; set; }
        public string Question { get; set; }
        public string QuestionMarathi { get; set; }
        public string Answer { get; set; }
        public string AnswerMarathi { get; set; }
        public Int32 SeqNo { get; set; }
        public Int16 RegionID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}
