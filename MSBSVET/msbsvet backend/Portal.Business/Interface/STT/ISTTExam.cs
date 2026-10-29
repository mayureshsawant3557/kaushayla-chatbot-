using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business;

public interface ISTTExam
{
    DataTable GetFilters(long userId);
    DataTable GetCandidatesByBatch(long batchId);
    DataSet GetAssessmentByBatch(long batchId);
    DataSet GetInstituteCourseActiveBatches();
    DataSet GetCourseSubjects(string courseCode);
    DataSet GetAssessmentCourses(long batchId);
    DataSet GetBatchAgencies (long batchId);
    DataSet GetCandidatesByBatchWithFeeStatus(long batchId);
    DataSet SaveBatchAgencyMapping(SaveBatchAgencyMappingRequest request);
    DataSet GetAgenciesForReassign(long batchId);

    DataTable SaveDraft(STTSaveRequest request, int userId);
    DataTable Submit(STTSaveRequest request, int userId);
    DataTable GetDashboardSummary(long batchId);
}

