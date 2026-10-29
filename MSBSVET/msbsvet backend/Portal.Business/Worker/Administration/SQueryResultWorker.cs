using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Administration
{
    public class SQueryResultWorker : ISQueryResult
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public SQueryResultWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public SQueryResultEntity ExecuteSQueryResult(SQueryResultEntity SQueryResultEntity)
        {
            try
            {
                SQueryResultEntity.ResultTables = objData.ExecuteSQueryResult(SQueryResultEntity);
                if (SQueryResultEntity.ResultTables != null &&
                    SQueryResultEntity.ResultTables.Tables != null &&
                    SQueryResultEntity.ResultTables.Tables.Count == 1 &&
                    SQueryResultEntity.ResultTables.Tables[0].Rows != null &&
                    SQueryResultEntity.ResultTables.Tables[0].Rows.Count == 1 &&
                    SQueryResultEntity.ResultTables.Tables[0].Columns != null &&
                    SQueryResultEntity.ResultTables.Tables[0].Columns.Count == 1)
                {
                    SQueryResultEntity.IsSuccessError = Convert.ToString(SQueryResultEntity.ResultTables.Tables[0].Rows[0][0]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ExecuteSQueryResult");
            }
            return SQueryResultEntity;
        }

        public DataTable GetAllSQLTablesDropDown()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetAllSQLTablesDropDown();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllSQLTablesDropDown");
                throw ex;
            }
            return dt;
        }

        public bool GetMobileAuthenticationFlag()
        {
            bool IsMobileAuthRequired = false;
            try
            {
                IsMobileAuthRequired = objData.GetMobileAuthenticationFlag();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMobileAuthenticationFlag");
                IsMobileAuthRequired = false;
            }
            return IsMobileAuthRequired;
        }

        public DataTable GetSQueryExecutersMobileNumber()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetSQueryExecutersMobileNumber();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAllSQLTablesDropDown");
                throw ex;
            }
            return dt;
        }
    }
}
