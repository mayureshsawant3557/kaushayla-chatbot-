using Portal.Entities;
using System.Data;

namespace Portal.Business;

/* =============================================================================
   Module : STT -> Batch Result Report
   File   : Portal.Business/Interface/STT/ISTTBatchResultReport.cs
   Purpose: Service contract. Returns raw DataTable/DataSet (mirrors ISTTExam);
            the controller wraps them in ApiResponse<T>.
   ============================================================================= */
public interface ISTTBatchResultReport
{
    DataSet GetFilters(int userTypeId, string userLoginId, int regionId, int districtId);
    DataTable GetSummary(STTBatchResultReportRequest request);
    DataTable GetBatchWiseSystemCertificate(long BatchID);

    DataSet GetBatchList(STTBatchResultReportRequest request);
    DataSet GetBatchCandidates(STTBatchCandidateReportRequest request);

    DataTable UpdateBatchCertificateDates(STTBatchCertificateDateRequest request);
    DataTable GetBatchDispatchSlip(long batchId);
    DataSet GetBatchResultSheet(long batchId);
}
