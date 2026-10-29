using Portal.Entities.DVET;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.DVET
{
    public interface IDVET
    {
        DataTable StateFund_SaveAllocation(
    SaveStateFundAllocationRequest request);
        DataSet StateFund_GetAllocation(int FinancialYearID);


    }
}
