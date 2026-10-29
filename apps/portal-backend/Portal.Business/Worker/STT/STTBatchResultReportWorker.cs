using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using System;
using System.Data;

namespace Portal.Business;

/* =============================================================================
   Module : STT -> Batch Result Report
   File   : Portal.Business/Worker/STT/STTBatchResultReportWorker.cs
   Purpose: Delegates to the shared Repository, logs failures via
            CommonHelper.SaveException and rethrows so the controller returns a
            proper error (a report must not silently return an empty success).
   ============================================================================= */
public class STTBatchResultReportWorker : ISTTBatchResultReport
{
    private readonly Repository objData;

    public STTBatchResultReportWorker(Repository repository)
    {
        objData = repository ?? throw new ArgumentNullException(nameof(repository));
    }

    public DataSet GetFilters(int userTypeId, string userLoginId, int regionId, int districtId)
    {
        DataSet ds = null;
        try
        {
            ds = objData.GetSTTBatchResultFilters(userTypeId, userLoginId, regionId, districtId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetFilters");
            throw;
        }
        return ds;
    }

    public DataTable GetSummary(STTBatchResultReportRequest request)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetSTTBatchResultSummary(request);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetSummary");
            throw;
        }
        return dt;
    }
    public DataTable GetBatchWiseSystemCertificate(long BatchID)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetBatchWiseSystemCertificate(BatchID);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetBatchWiseSystemCertificate");
            throw;
        }
        return dt;
    }

    public DataSet GetBatchList(STTBatchResultReportRequest request)
    {
        DataSet ds = null;
        try
        {
            ds = objData.GetSTTBatchResultList(request);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetBatchList");
            throw;
        }
        return ds;
    }

    public DataSet GetBatchCandidates(STTBatchCandidateReportRequest request)
    {
        DataSet ds = null;
        try
        {
            ds = objData.GetSTTBatchResultCandidates(request);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetBatchCandidates",
                                      request?.BatchID.ToString());
            throw;
        }
        return ds;
    }

    public DataTable UpdateBatchCertificateDates(STTBatchCertificateDateRequest request)
    {
        DataTable dt = null;
        try
        {
            dt = objData.UpdateSTTBatchCertificateDates(request);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_UpdateBatchCertificateDates",
                                      request?.BatchID.ToString());
            throw;
        }
        return dt;
    }

    public DataTable GetBatchDispatchSlip(long batchId)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetSTTBatchDispatchSlip(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetBatchDispatchSlip",
                                      batchId.ToString());
            throw;
        }
        return dt;
    }

    public DataSet GetBatchResultSheet(long batchId)
    {
        DataSet ds = null;
        try
        {
            ds = objData.GetSTTBatchResultSheet(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STTBatchResultReport_GetBatchResultSheet",
                                      batchId.ToString());
            throw;
        }
        return ds;
    }
}
