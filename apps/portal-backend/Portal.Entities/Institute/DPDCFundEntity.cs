using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class DPDCFundEntity
    {
        public int ID { get; set; }
        public long InstituteID { get; set; }
        public string CollegeRegistrationNo { get; set; }
        public int FinancialYearID { get; set; }
        public string FinancialYear { get; set; }
        public decimal Allotted_2203_Institute { get; set; }
        public decimal Allotted_2230_Institute { get; set; }
        public decimal TotalAllottedToInstitute { get; set; }
        public int UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

}
