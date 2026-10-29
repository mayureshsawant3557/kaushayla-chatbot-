using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.DVETO
{
    public class SaveHeadDocumentEntity
    {
        public int OfficeID { get; set; }
        public int SectionID { get; set; }
        public string HeadCode { get; set; }
        public string HeadName { get; set; }
        public string DocumentUrl { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsActive { get; set; }
        public string CreatedBy { get; set; }
        public string CreatedIPByAddress { get; set; }
        public int FinancialYearID { get; set; }
    }
}
