using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Data
{
    /* =========================================================================
       Module : STT -> Batch Result Report
       File   : Portal.Data/Pool/STT/Repository.STTBatchResultReport.cs
       Purpose: Executes the ExamSTT_BatchResultReport_* stored procedures.
                Part of the shared `partial class Repository` (reuses the
                base `_dbAccess` and the private FirstTable helper from
                Repository.Base / Repository.STTExam).
       ========================================================================= */
    public partial class Repository
    {
        // Cascading filter source rows: 6 tables in one DataSet.
        public DataSet GetSTTBatchResultFilters(int userTypeId, string userLoginId, int regionId, int districtId)
        {
            var parms = new Dictionary<string, object>
            {
                { "@UserTypeID",  userTypeId },
                { "@UserLoginID", string.IsNullOrWhiteSpace(userLoginId) ? (object)DBNull.Value : userLoginId },
                { "@RegionID",    regionId },
                { "@DistrictID",  districtId }
            };
            return _dbAccess.GetDataSet("ExamSTT_BatchResultReport_GetFilters", parms);
        }

        // KPI summary: single row.
        public DataTable GetSTTBatchResultSummary(STTBatchResultReportRequest r)
        {
            var ds = _dbAccess.GetDataSet("ExamSTT_BatchResultReport_GetSummary", BuildReportParams(r));
            return FirstTable(ds);
        }
        public DataTable GetBatchWiseSystemCertificate(long BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", BatchID);
            //param.Add("@InstituteID", InstituteID);
            //param.Add("@IsResultFresh", IsResultFresh);
            return _dbAccess.GetDataTable("ResultSTT_InstitutePrintResultCertificate", param);
        }

        // Batch grid: Tables[0] = rows, Tables[1] = TotalRecords.
        public DataSet GetSTTBatchResultList(STTBatchResultReportRequest r)
        {
            var parms = BuildReportParams(r);
            parms.Add("@SearchText",    string.IsNullOrWhiteSpace(r.SearchText) ? (object)DBNull.Value : r.SearchText);
            parms.Add("@SortColumn",    string.IsNullOrWhiteSpace(r.SortColumn) ? "BatchID" : r.SortColumn);
            parms.Add("@SortDirection", string.IsNullOrWhiteSpace(r.SortDirection) ? "ASC" : r.SortDirection);
            parms.Add("@PageNumber",    r.PageNumber < 1 ? 1 : r.PageNumber);
            parms.Add("@PageSize",      r.PageSize);
            return _dbAccess.GetDataSet("ExamSTT_BatchResultReport_GetBatchList", parms);
        }

        // Drill-down: Tables[0] = candidate rows, Tables[1] = TotalRecords.
        public DataSet GetSTTBatchResultCandidates(STTBatchCandidateReportRequest r)
        {
            var parms = new Dictionary<string, object>
            {
                { "@BatchID",       r.BatchID },
                { "@UserTypeID",    r.UserTypeID },
                { "@UserLoginID",   string.IsNullOrWhiteSpace(r.UserLoginID) ? (object)DBNull.Value : r.UserLoginID },
                { "@SearchText",    string.IsNullOrWhiteSpace(r.SearchText) ? (object)DBNull.Value : r.SearchText },
                { "@SortColumn",    string.IsNullOrWhiteSpace(r.SortColumn) ? "CandidateName" : r.SortColumn },
                { "@SortDirection", string.IsNullOrWhiteSpace(r.SortDirection) ? "ASC" : r.SortDirection },
                { "@PageNumber",    r.PageNumber < 1 ? 1 : r.PageNumber },
                { "@PageSize",      r.PageSize }
            };
            return _dbAccess.GetDataSet("ExamSTT_BatchResultReport_GetBatchCandidates", parms);
        }

        // Result sheet: Tables[0] = header ("OBWCAttendanceResult"),
        // Tables[1] = candidate rows ("OBWCAttendanceResultCandidates").
        public DataSet GetSTTBatchResultSheet(long batchId)
        {
            var parms = new Dictionary<string, object> { { "@BatchID", batchId } };
            return _dbAccess.GetDataSet("ExamSTT_BatchResultReport_GetResultSheet", parms);
        }

        // Dispatch slip: single row feeding MOBWCDispatchSlip.rdlc ("OBWCCertificate").
        public DataTable GetSTTBatchDispatchSlip(long batchId)
        {
            var parms = new Dictionary<string, object> { { "@BatchID", batchId } };
            return _dbAccess.GetDataTable("ExamSTT_BatchResultReport_GetDispatchSlip", parms);
        }

        // Certificate print & dispatch dates: updates ExamSTT_AssessmentHeader
        // and returns the refreshed header row. Pass only the date being changed;
        // a null date leaves that column untouched.
        public DataTable UpdateSTTBatchCertificateDates(STTBatchCertificateDateRequest r)
        {
            var parms = new Dictionary<string, object>
            {
                { "@BatchID",      r.BatchID },
                { "@PrintDate",    r.PrintedDate.HasValue  ? (object)r.PrintedDate.Value.Date  : DBNull.Value },
                { "@DispatchDate", r.DispatchDate.HasValue ? (object)r.DispatchDate.Value.Date : DBNull.Value },
                { "@ModifiedBy",   string.IsNullOrWhiteSpace(r.ModifiedBy) ? (object)DBNull.Value : r.ModifiedBy },
                { "@ModifiedIP",   string.IsNullOrWhiteSpace(r.ModifiedIP) ? (object)DBNull.Value : r.ModifiedIP }
            };
            return _dbAccess.GetDataTable("ExamSTT_BatchResultReport_UpdateCertificateDates", parms);
        }

        // Shared filter + scope params for summary and grid.
        private static Dictionary<string, object> BuildReportParams(STTBatchResultReportRequest r)
        {
            return new Dictionary<string, object>
            {
                { "@UserTypeID",  r.UserTypeID },
                { "@UserLoginID", string.IsNullOrWhiteSpace(r.UserLoginID) ? (object)DBNull.Value : r.UserLoginID },
                { "@AgencyId",    r.AgencyId },
                { "@Status",      string.IsNullOrWhiteSpace(r.Status) ? (object)DBNull.Value : r.Status },
                { "@RegionID",    r.RegionID },
                { "@DistrictID",  r.DistrictID },
                { "@TalukaID",    r.TalukaID },
                { "@InstituteID", r.InstituteID },
                { "@CourseID",    r.CourseID }
            };
        }

    }
}
