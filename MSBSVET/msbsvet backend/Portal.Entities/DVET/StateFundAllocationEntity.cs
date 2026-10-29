using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.DVET
{
    public class StateFundAllocationEntity
    {
       
            public int FinancialYearID { get; set; }

            public string SectionCode { get; set; }

            public string BudgetCode { get; set; }

            public string ObjectCode { get; set; }

            public int AllocationTypeID { get; set; }

            public long? OfficeUserID { get; set; }

            public int? UserTypeID { get; set; }

            public decimal Amount { get; set; }

           public string Remarks { get; set; }
        
    }
}
