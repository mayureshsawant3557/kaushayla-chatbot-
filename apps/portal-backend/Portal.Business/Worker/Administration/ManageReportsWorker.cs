using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Administration
{
    public class ManageReportsWorker : IManageReports
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ManageReportsWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public string SaveReport(int ReportID, string ReportName, string ReportQuery, short RegionID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveReport(ReportID, ReportName, ReportQuery, RegionID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveReport");
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteReport(int ReportID, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteReport(ReportID, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteReport");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetReport(int ReportID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetReport(ReportID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetReport");
                throw ex;
            }
            return dt;
        }
        public DataTable GetReportList(short RegionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetReportList(RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetReportList");
                throw ex;
            }
            return dt;
        }
        public DataTable ExecuteReport(int ReportID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.ExecuteReport(ReportID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ExecuteReport");
                throw ex;
            }
            return dt;
        }
        public DataTable GetTableViewList()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetTableViewList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetTableViewList");
                throw ex;
            }
            return dt;
        }
        public DataTable GetColumnList(string TableViewName)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetColumnList(TableViewName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetColumnList");
                throw ex;
            }
            return dt;
        }
        public DataTable GetRestrictedKeywordList()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetRestrictedKeywordList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetRestrictedKeywordList");
                throw ex;
            }
            return dt;
        }
    }
}
