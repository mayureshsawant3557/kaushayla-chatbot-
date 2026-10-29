using Newtonsoft.Json;
using Portal.Entities.DVET;
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


        public DataTable StateFund_SaveAllocation(
    SaveStateFundAllocationRequest request)
        {
            string jsonData =
                JsonConvert.SerializeObject(request.Data);

            Dictionary<string, object> param =
                new Dictionary<string, object>();

            param.Add("@JsonData", jsonData);

            param.Add("@UserID", request.UserID);

            return _dbAccess.GetDataTable(
                "StateFund_SaveAllocation",
                param);
        }
        public DataSet StateFund_GetAllocation(int FinancialYearID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FinancialYearID", FinancialYearID);

            return _dbAccess.GetDataSet(
                "StateFund_GetAllocation",
                param);
        }





    }
}
