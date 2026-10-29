using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business;

public class STTExamWorker :ISTTExam
{
    private readonly Repository objData;
    //Inject Repository via Constructor 
    public STTExamWorker(Repository repository)
    {
        objData = repository ?? throw new ArgumentNullException(nameof(repository));
    }
    public DataTable GetFilters(long userId)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetFilters(userId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STT_GetFilters");
        }
        return dt;
    }

    public DataTable GetCandidatesByBatch(long batchId)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetCandidatesByBatch(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STT_GetCandidatesByBatch", batchId.ToString());
        }
        return dt;
    }

    public DataSet GetAssessmentByBatch(long batchId)
    {
        DataSet ds = null;
        try
        {
            ds = objData.GetAssessmentByBatch(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STT_GetAssessmentByBatch", batchId.ToString());
        }
        return ds;
    }
    public DataSet GetInstituteCourseActiveBatches()
    {
        DataSet ds = null;

        try
        {
            ds = objData.GetInstituteCourseActiveBatches();
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(
                ex.Message,
                "CMSAdmin_GetInstituteCourseActiveBatches"
            );

            throw;
        }

        return ds;
    }
    public DataSet GetCourseSubjects(string courseCode)
    {
        DataSet ds = null;

        try
        {
            ds = objData.GetCourseSubjects(courseCode);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(
                ex.Message,
                "CMSAdmin_GetCourseSubjects"
            );

            throw;
        }

        return ds;
    }
    public DataSet GetAssessmentCourses(long batchId)
    {
        {
            DataSet ds = null;

            try
            {
                ds = objData.GetAssessmentCourses(batchId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "CMSAdmin_GetAssessmentCourses"
                );

                throw;
            }

            return ds;
        }
    }
    public DataSet GetBatchAgencies(long batchId)
    {
        {
            DataSet ds = null;

            try
            {
                ds = objData.GetBatchAgencies(batchId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "CMSAdmin_GetAssessmentCourses"
                );

                throw;
            }

            return ds;
        }
    }
    public DataSet GetCandidatesByBatchWithFeeStatus(long batchId)
    {
        DataSet ds = null;

        try
        {
            ds = objData.GetCandidatesByBatchWithFeeStatus(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(
                ex.Message,
                "ExamSTT_GetCandidatesByBatchWithFeeStatus"
            );

            throw;
        }

        return ds;
    }
    public DataSet GetAgenciesForReassign(long batchId)
    {
        DataSet ds = null;

        try
        {
            ds = objData.GetAgenciesForReassign(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(
                ex.Message,
                "CMSAdmin_GetAgenciesForReassign"
            );

            throw;
        }

        return ds;
    }
    public DataSet SaveBatchAgencyMapping(SaveBatchAgencyMappingRequest request)
    {
        DataSet ds = null;

        try
        {
            ds = objData.SaveBatchAgencyMapping(request);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(
                ex.Message,
                "CMSAdmin_SaveBatchAgencyMapping"
            );

            throw;
        }

        return ds;
    }


    public DataTable SaveDraft(STTSaveRequest request, int userId)
        => Persist(request, userId, "Draft");

    public DataTable Submit(STTSaveRequest request, int userId)
        => Persist(request, userId, "Submitted");

    public DataTable GetDashboardSummary(long batchId)
    {
        DataTable dt = null;
        try
        {
            dt = objData.GetDashboardSummary(batchId);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STT_GetDashboardSummary", batchId.ToString());
        }
        return dt;
    }

    // ---------------------------------------------------------------------
    //  Shared persist path for Draft + Submit
    // ---------------------------------------------------------------------
    private DataTable Persist(STTSaveRequest request, int userId, string status)
    {
        // Input validation -> surfaced as 400 by the controller.
        var validation = Validate(request);
        if (validation != null)
            throw new ArgumentException(validation);

        DataTable dt = null;
        try
        {
            dt = objData.SaveOrSubmit(request, userId, status);
        }
        catch (Exception ex)
        {
            CommonHelper.SaveException(ex.Message, "STT_Save_" + status, request?.BatchID.ToString());
            throw; // let the controller map SP errors (e.g. locked batch)
        }
        return dt;
    }

    /// <summary>Returns an error message, or null when the request is valid.</summary>
    private static string Validate(STTSaveRequest request)
    {
        if (request == null) return "Request body is required.";
        if (request.BatchID <= 0) return "A valid Batch is required.";
        if (request.AssessmentDate == default) return "Assessment date is mandatory.";
        if (request.Candidates == null || request.Candidates.Count == 0)
            return "At least one candidate is required.";

        foreach (var c in request.Candidates)
        {
            if (c.TotalTheory140 < 0 || c.TotalTheory140 > 140)
                return $"Theory marks for candidate {c.CandidateID} must be 0-140.";
            if (c.PracticalObservation230 < 0 || c.PracticalObservation230 > 230)
                return $"Observation marks for candidate {c.CandidateID} must be 0-230.";
            if (c.PracticalViva80 < 0 || c.PracticalViva80 > 80)
                return $"Viva marks for candidate {c.CandidateID} must be 0-80.";
        }

        // Duplicate candidate guard
        var dup = request.Candidates.GroupBy(c => c.CandidateID).Any(g => g.Count() > 1);
        if (dup) return "Duplicate candidate rows detected.";

        return null;
    }

}

