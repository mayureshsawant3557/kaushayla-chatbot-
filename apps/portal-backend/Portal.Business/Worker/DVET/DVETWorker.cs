//using NuGet.Protocol.Core.Types;
using Portal.Business.Interface.DVET;
using Portal.Business.Interface.DVETO;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.DVET;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace Portal.Business.Worker.DVET
{
    public class DVETWorker : IDVET
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public DVETWorker(Repository objData)
        {
            _objData = objData;
        }
        public DataTable StateFund_SaveAllocation(
    SaveStateFundAllocationRequest request)
        {
            return _objData.StateFund_SaveAllocation(request);
        }
        public DataSet StateFund_GetAllocation(int FinancialYearID)
        {
            DataSet ds = null;

            try
            {
                ds = _objData.StateFund_GetAllocation(FinancialYearID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "StateFund_GetAllocation",
                    FinancialYearID.ToString());
            }

            return ds;
        }





    }

}
