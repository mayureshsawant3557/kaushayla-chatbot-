using Portal.Data.Source;
using Portal.Data.Pool;
using Portal.Entities.Obwc;
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

      
        public string GetSaveUpdateOBWCResult(List<ObwcResultEntity> ResultDetails, DateTime CreatedDateTime, string CreatedBy, string CreatedByIPAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ResultDetails", GetXML(ResultDetails));
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@CreatedByIPAddress", CreatedByIPAddress);
            return _dbAccess.ExecuteScalar("OBWC_UpateDataFromMySQL", param).ToString();
        }

        public DataTable GetResultByBatchID(string BatchID, string BatchType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            param.Add("@BatchType", BatchType);
            return _dbAccess.GetDataTable("OBWC_GetResultByBatchID", param);
        }
        public DataTable GetResultByBatchIDExport(string BatchID, string BatchType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID); param.Add("@BatchType", BatchType);
            return _dbAccess.GetDataTable("OBWC_GetResultByBatchIDExport", param);
        }

        public DataTable GetSearchResultExport(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            param.Add("@CoureseID", CoureseID);
            param.Add("@District", District);
            param.Add("@batch_id", batch_id);
            param.Add("@batch_status", batch_status);
            param.Add("@BatchType", batch_type);
            return _dbAccess.GetDataTable("OBWC_GetResultSearchExport", param);
        }
        public DataTable GetResultByCandidate(string BatchID, string SiteID, string CandidateID, string BatchType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            param.Add("@SiteID", SiteID); param.Add("@CandidateID", CandidateID);
            param.Add("@BatchType", BatchType);
            return _dbAccess.GetDataTable("OBWC_GetResultByCandidate", param);
        }
        public DataTable GetSearchResult(Int64 InstituteID, Int64 CoureseID, string District, string batch_id, string batch_status, string batch_type)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteID", InstituteID);
            param.Add("@CoureseID", CoureseID);
            param.Add("@District", District);
            param.Add("@batch_id", batch_id);
            param.Add("@batch_status", batch_status);
            param.Add("@BatchType", batch_type);
            return _dbAccess.GetDataTable("OBWC_GetResultSearch", param);
        }

        public DataTable GetTraningPartnerOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetTraningPartnerOBWCResult");
        }
        public DataTable GetDistrictOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetDistrictOBWCResult");
        }
        public DataTable GetCourseOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetCourseOBWCResult");
        }
        public DataTable GetBatchStatusOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetBatchStatusOBWCResult");
        }
        public DataTable GetBatchTypeOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetBatchTypeOBWCResult");
        }
        public DataTable GetBatchOBWCResult()
        {
            return _dbAccess.GetDataTable("OBWC_GetBatchOBWCResult");
        }

        public string UpdateBatchDate(string BatchID, string Type, DateTime SelectedDate, string CreatedBy, string CreatedByIPAddress, string BatchType)
        {
            var param = new Dictionary<string, object>();

            param.Add("@BatchID", BatchID);
            param.Add("@Type", Type);
            param.Add("@Date", SelectedDate);
            param.Add("@CreatedBy", CreatedBy);
            param.Add("@CreatedByIPAddress", CreatedByIPAddress);
            param.Add("@BatchType", BatchType);
            return _dbAccess.ExecuteScalar("OBWC_UpdateBatchDate", param).ToString();
        }
        public DataTable GetTraningPartnerOBWCResultForInstiutte(string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteCode", InstituteCode);
            return _dbAccess.GetDataTable("OBWC_GetTraningPartnerOBWCResultForInstiutte", param);
        }
        public DataTable GetBatchOBWCResultForInstiutte(string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteCode", InstituteCode);
            return _dbAccess.GetDataTable("OBWC_GetBatchOBWCResultForInstiutte", param);
        }

        public DataTable GetDistrictOBWCResultForInstitute(string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteCode", InstituteCode);
            return _dbAccess.GetDataTable("OBWC_GetDistrictOBWCResultForInstiutte", param);
        }
        public DataTable GetCourseOBWCResultForInstitute(string InstituteCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@InstituteCode", InstituteCode);
            return _dbAccess.GetDataTable("OBWC_GetCourseOBWCResultForInstiutte", param);
        }

        public DataSet GetResultSheetBatchCode(string BatchCode)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchCode", BatchCode);
            return _dbAccess.GetDataSet("OBWC_GetResultSheetBatchCode", param);

        }
        public DataSet GetTraningPartnerOBWCResultMasters(Int64 InstituteID, Int64 CourseID, string District, string batch_status)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", InstituteID);
            param.Add("@CourseID", CourseID);
            param.Add("@District", District);
            param.Add("@batch_status", batch_status);
            return _dbAccess.GetDataSet("OBWC_GetTraningPartnerOBWCResultMasters", param);
        }




    }
}
