using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace Portal.Data 
{
    public partial class Repository
    {
        public DataTable GetFilters(long userId)
        {
    
            var parms = new Dictionary<string, object>
            {
                { "@UserId", userId }
            };
            var ds = _dbAccess.GetDataSet("ExamSTT_GetFilters", parms);
            return FirstTable(ds);
        }

        // ---------------------------------------------------------------------
        //  CANDIDATES
        // ---------------------------------------------------------------------
        public DataTable GetCandidatesByBatch(long batchId)
        {
            var parms = new Dictionary<string, object>
            {
                { "@BatchID", batchId }
            };
            var ds = _dbAccess.GetDataSet("ExamSTT_GetCandidatesByBatch", parms);
            return FirstTable(ds);
        }
        public DataSet GetInstituteCourseActiveBatches()
        {
            var parms = new Dictionary<string, object>();

            return _dbAccess.GetDataSet(
                "CMSAdmin_GetInstituteCourseActiveBatches",
                parms
            );
        }
        public DataSet GetCourseSubjects(string courseCode)
        {
            var parms = new Dictionary<string, object>
    {
        { "@CourseCode", courseCode }
    };

            return _dbAccess.GetDataSet(
                "CMSAdmin_GetCourseSubjects",
                parms
            );
        }
        public DataSet GetAssessmentCourses(long batchId)
        {
            var parms = new Dictionary<string, object>
    {
        { "@BatchID", batchId }
    };

            return _dbAccess.GetDataSet(
                "CMSAdmin_GetAssessmentCourses",
                parms);
        }
        public DataSet GetBatchAgencies(long batchId)
        {
            var parms = new Dictionary<string, object>
    {
        { "@BatchID", batchId }
    };

            return _dbAccess.GetDataSet(
                "CMSAdmin_GetBatchAgencies",
                parms);
        }
        public DataSet GetCandidatesByBatchWithFeeStatus(long batchId)
        {
            var parms = new Dictionary<string, object>
    {
        { "@BatchID", batchId }
    };

            return _dbAccess.GetDataSet(
                "ExamSTT_GetCandidatesByBatchWithFeeStatus",
                parms);
        }
        public DataSet GetAgenciesForReassign(long batchId)
        {
            var parms = new Dictionary<string, object>
    {
        { "@BatchID", batchId }
    };

            return _dbAccess.GetDataSet(
                "CMSAdmin_GetAgenciesForReassign",
                parms);
        }
        public DataSet SaveBatchAgencyMapping(
    SaveBatchAgencyMappingRequest request)
        {
            var parms = new Dictionary<string, object>
    {
        { "@BatchID", request.BatchID },
        { "@UserID", request.UserID },
        { "@ModifiedBy", request.ModifiedBy },
        { "@ModifiedIP", request.ModifiedIP }
    };

            return _dbAccess.GetDataSet(
                "CMSAdmin_SaveBatchAgencyMapping",
                parms
            );
        }

        // ---------------------------------------------------------------------
        //  EXISTING ASSESSMENT (DataSet: Tables[0] = header, Tables[1] = details)
        // ---------------------------------------------------------------------
        public DataSet GetAssessmentByBatch(long batchId)
        {
            var parms = new Dictionary<string, object>
            {
                { "@BatchID", batchId }
            };
            return _dbAccess.GetDataSet("ExamSTT_GetAssessmentByBatch", parms);
        }

        // ---------------------------------------------------------------------
        //  SAVE / SUBMIT  (TVP @Details + scalar audit @IPAddress)
        //  Returns the SP's single-row result (AssessmentHeaderId, Status).
        // ---------------------------------------------------------------------
        public DataTable SaveOrSubmit(STTSaveRequest request, int userId, string status)
        {
            var procName = string.Equals(status, "Submitted", StringComparison.OrdinalIgnoreCase)
                ? "ExamSTT_SubmitAssessment"
                : "ExamSTT_SaveDraft";

            var parms = new Dictionary<string, object>
    {
        { "@CollegeID",      request.CollegeID },
        { "@CourseID",       request.CourseID },
        { "@BatchID",        request.BatchID },
        { "@AssessmentDate", request.AssessmentDate.Date },
        { "@UserId",         userId },
        { "@IPAddress",      string.IsNullOrWhiteSpace(request.IpAddress)
                                ? (object)DBNull.Value : request.IpAddress },
        // Candidate marks serialised as XML; the SP shreds it with .nodes().
        { "@DetailsXml",     BuildDetailXml(request.Candidates) },
    };

            var ds = _dbAccess.GetDataSet(procName, parms);
            return FirstTable(ds);
        }

        // ---------------------------------------------------------------------
        //  DASHBOARD
        // ---------------------------------------------------------------------
        public DataTable GetDashboardSummary(long batchId)
        {
            var parms = new Dictionary<string, object>
            {
                { "@BatchID", batchId }
            };
            var ds = _dbAccess.GetDataSet("ExamSTT_GetDashboardSummary", parms);
            return FirstTable(ds);
        }

        // ---------------------------------------------------------------------
        //  Helpers
        // ---------------------------------------------------------------------
        private static DataTable FirstTable(DataSet ds) =>
            (ds != null && ds.Tables.Count > 0) ? ds.Tables[0] : new DataTable();

        /// <summary>Builds the TVP DataTable. Column order MUST match the
        /// dbo.ExamSTT_AssessmentDetailType definition. Totals / percentage /
        /// grade are recomputed here (defence in depth — never trust client
        /// totals); the client sends only the three raw marks.</summary>
        private static DataTable BuildDetailTable(IEnumerable<STTMarkEntryRequest> candidates)
        {
            // TableName set to the SQL type name as a hint for helpers that map
            // a DataTable to a TVP using its TableName.
            var table = new DataTable("dbo.ExamSTT_AssessmentDetailType");
            table.Columns.Add("CandidateID", typeof(int));
            table.Columns.Add("ApplicationID", typeof(int));
            table.Columns.Add("TotalTheory140", typeof(int));
            table.Columns.Add("PracticalObservation230", typeof(int));
            table.Columns.Add("PracticalViva80", typeof(int));
            table.Columns.Add("TotalPractical310", typeof(int));
            table.Columns.Add("GrandTotal450", typeof(int));
            table.Columns.Add("Percentage", typeof(decimal));
            table.Columns.Add("Grade", typeof(string));

            if (candidates == null) return table;

            foreach (var c in candidates)
            {
                var totalPractical = c.PracticalObservation230 + c.PracticalViva80;
                var grandTotal = c.TotalTheory140 + totalPractical;
                var percentage = Math.Round((decimal)grandTotal / 450m * 100m, 2);
                var grade = ComputeGrade(c.TotalTheory140, c.PracticalObservation230, c.PracticalViva80, grandTotal);

                table.Rows.Add(
                    c.CandidateID,
                    c.ApplicationID,
                    c.TotalTheory140,
                    c.PracticalObservation230,
                    c.PracticalViva80,
                    totalPractical,
                    grandTotal,
                    percentage,
                    grade);
            }
            return table;
        }
        private static string ComputeGrade(int theory, int obs, int viva, int grandTotal)
        {
            if (theory == 0 && obs == 0 && viva == 0) return "ABSENT";
            return grandTotal >= 225 ? "PASS" : "FAIL";
        }
        private static string BuildDetailXml(IEnumerable<STTMarkEntryRequest> candidates)
        {
            var root = new XElement("Details");

            if (candidates != null)
            {
                foreach (var c in candidates)
                {
                    var totalPractical = c.PracticalObservation230 + c.PracticalViva80;
                    var grandTotal = c.TotalTheory140 + totalPractical;
                    var percentage = Math.Round((decimal)grandTotal / 450m * 100m, 2);
                    var grade = ComputeGrade(c.TotalTheory140, c.PracticalObservation230, c.PracticalViva80, grandTotal);

                    root.Add(new XElement("Detail",
                        new XAttribute("CandidateID", c.CandidateID),
                        new XAttribute("ApplicationID", c.ApplicationID),
                        new XAttribute("TotalTheory140", c.TotalTheory140),
                        new XAttribute("PracticalObservation230", c.PracticalObservation230),
                        new XAttribute("PracticalViva80", c.PracticalViva80),
                        new XAttribute("TotalPractical310", totalPractical),
                        new XAttribute("GrandTotal450", grandTotal),
                        new XAttribute("Percentage", percentage),
                        new XAttribute("Grade", grade ?? string.Empty)));
                }
            }

            // No XML declaration -> safe to pass to an XML / NVARCHAR(MAX) parameter.
            return root.ToString(SaveOptions.DisableFormatting);
        }
    }
}
