using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;

namespace Portal.Business.Interface.Administration
{
    public interface IManageReports
    {
        string SaveReport(Int32 ReportID, string ReportName, string ReportQuery, Int16 RegionID, string UserLoginID, string IPAddress);
        string DeleteReport(Int32 ReportID, string UserLoginID, string IPAddress);
        DataTable GetReport(Int32 ReportID);
        DataTable GetReportList(Int16 RegionID);
        DataTable ExecuteReport(Int32 ReportID);
        DataTable GetTableViewList();
        DataTable GetColumnList(string TableViewName);
        DataTable GetRestrictedKeywordList();
    }
}
