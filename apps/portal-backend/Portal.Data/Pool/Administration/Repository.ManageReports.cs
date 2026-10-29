using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        public string SaveReport(Int32 ReportID, string ReportName, string ReportQuery, Int16 RegionID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ReportID", ReportID);
            param.Add("@ReportName", ReportName);
            param.Add("@ReportQuery", ReportQuery);
            param.Add("@RegionID", RegionID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Administration_SaveReport", param).ToString();
        }
        public string DeleteReport(Int32 ReportID, string UserLoginID, string IPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ReportID", ReportID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@IPAddress", IPAddress);

            return _dbAccess.ExecuteScalar("Administration_DeleteReport", param).ToString();
        }
        public DataTable GetReport(Int32 ReportID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ReportID", ReportID);

            return _dbAccess.GetDataTable("Administration_GetReport", param);
        }
        public DataTable GetReportList(Int16 RegionID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);

            return _dbAccess.GetDataTable("Administration_GetReportList", param);
        }
        public DataTable ExecuteReport(Int32 ReportID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ReportID", ReportID);

            return _dbAccess.GetDataTable("Administration_ExecuteReport", param);
        }
        public DataTable GetTableViewList()
        {
            return _dbAccess.GetDataTable("Administration_GetTableViewList");
        }
        public DataTable GetColumnList(string TableViewName)
        {
            var param = new Dictionary<string, object>();

            param.Add("@TableViewName", TableViewName);

            return _dbAccess.GetDataTable("Administration_GetColumnList", param);
        }
        public DataTable GetRestrictedKeywordList()
        {
            return _dbAccess.GetDataTable("Administration_GetRestrictedKeywordList");
        }
    }
}
