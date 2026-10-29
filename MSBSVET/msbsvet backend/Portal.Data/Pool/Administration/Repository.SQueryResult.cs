using Portal.Entities.Administration;
using System;
using System.Collections.Generic;

using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetAllSQLTablesDropDown()
        {
            return _dbAccess.GetDataTable("Administration_GetAllSQLTables");
        }
        public DataTable GetSQueryExecutersMobileNumber()
        {
            return _dbAccess.GetDataTable("Administration_GetSQueryExecutersMobileNumber");
        }
        public DataSet ExecuteSQueryResult(SQueryResultEntity SQueryResultEntity)
        {
            string spName = "Administration_ExecuteSQLResult";
            var parms = new Dictionary<string, object>();
            parms.Add("@SQLQuery", SQueryResultEntity.SQLQuery);
            parms.Add("@UserName", SQueryResultEntity.UserName);
            parms.Add("@IPAddress", SQueryResultEntity.IPAddress);
            parms.Add("@MobileNumber", SQueryResultEntity.MobileNumber);
            return _dbAccess.GetDataSet(spName, parms);
        }
        public bool GetMobileAuthenticationFlag()
        {
            return Convert.ToBoolean(_dbAccess.ExecuteScalar("Administration_GetMobileAuthenticationFlag"));
        }
    }
}
