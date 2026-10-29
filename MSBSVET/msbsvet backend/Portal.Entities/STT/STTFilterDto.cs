using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities 
{

    // -------------------------------------------------------------------------
    //  FILTERS
    // -------------------------------------------------------------------------
    /// <summary>One flat row from ExamSTT_GetFilters. The UI builds the
    /// cascading Institute / Course / Batch dropdowns from a list of these.</summary>

    public class STTFilterDto
    {
        public string InstituteName { get; set; }
        public string InstituteCode { get; set; }
        public int InstituteId { get; set; }
        public int BatchID { get; set; }
        public int CourseID { get; set; }
        public string CourseCode { get; set; }
        public string CourseNameDisplay { get; set; }
    }

    // -------------------------------------------------------------------------
    //  CANDIDATE / DETAIL ROW
    // -------------------------------------------------------------------------
    /// <summary>A candidate row as shown in the editable grid. Used both for
    /// loading (ExamSTT_GetCandidatesByBatch) and as the per-candidate payload
    /// inside a save/submit request.</summary>
    public class STTCandidateDto
    {
        public int CollegeID { get; set; }
        public int CourseID { get; set; }
        public int BatchID { get; set; }

        public int CandidateID { get; set; }
        public int ApplicationID { get; set; }
        public string ApplicationIDDisplay { get; set; }
        public string CandidateName { get; set; }

        public int TotalTheory140 { get; set; }
        public int PracticalObservation230 { get; set; }
        public int PracticalViva80 { get; set; }

        public int TotalPractical310 { get; set; }
        public int GrandTotal450 { get; set; }
        public decimal Percentage { get; set; }
        public string Grade { get; set; }

        public string AssessmentDate { get; set; }
        public string RowStatus { get; set; }

        public string InstituteName { get; set; }
        public string CourseCode { get; set; }
        public string CourseNameDisplay { get; set; }
    }

    // -------------------------------------------------------------------------
    //  REQUEST MODELS
    // -------------------------------------------------------------------------
    /// <summary>Per-candidate marks submitted by the client. Only the three raw
    /// marks are trusted; totals / percentage / grade are re-computed server side.</summary>
    public class STTMarkEntryRequest
    {
        [Required] public int CandidateID { get; set; }
        [Required] public int ApplicationID { get; set; }

        [Range(0, 140, ErrorMessage = "Theory must be between 0 and 140.")]
        public int TotalTheory140 { get; set; }

        [Range(0, 230, ErrorMessage = "Practical Observation must be between 0 and 230.")]
        public int PracticalObservation230 { get; set; }

        [Range(0, 80, ErrorMessage = "Practical Viva must be between 0 and 80.")]
        public int PracticalViva80 { get; set; }
    }

    /// <summary>Save (draft) / Submit payload for a whole batch.</summary>
    public class STTSaveRequest
    {
        [Required] public long CollegeID { get; set; }
        [Required] public long CourseID { get; set; }
        [Required] public long BatchID { get; set; }

        [Required(ErrorMessage = "Assessment date is mandatory.")]
        public DateTime AssessmentDate { get; set; }

        /// <summary>Client IP address. Sent by the UI; if empty the controller
        /// falls back to the request connection's remote IP.</summary>
        [MaxLength(45)]
        public string IpAddress { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one candidate is required.")]
        public List<STTMarkEntryRequest> Candidates { get; set; } = new();
    }
    public class SaveBatchAgencyMappingRequest
    {
        public long BatchID { get; set; }
        public long UserID { get; set; }
        public string ModifiedBy { get; set; } = "Admin";
        public string ModifiedIP { get; set; }
    }

    // -------------------------------------------------------------------------
    //  RESPONSE MODELS
    // -------------------------------------------------------------------------
    /// <summary>Existing saved assessment for a batch (header + details).</summary>
    public class STTAssessmentResponse
    {
        public STTHeaderDto Header { get; set; }
        public List<STTDetailDto> Details { get; set; } = new();
        public bool IsSubmitted =>
            string.Equals(Header?.Status, "Submitted", StringComparison.OrdinalIgnoreCase);
    }

    public class STTHeaderDto
    {
        public int AssessmentHeaderId { get; set; }
        public int CollegeID { get; set; }
        public int CourseID { get; set; }
        public int BatchID { get; set; }
        public string AssessmentDate { get; set; }
        public string Status { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? CreatedDate { get; set; }
        public int? ModifiedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }
    }

    public class STTDetailDto
    {
        public int AssessmentDetailId { get; set; }
        public int AssessmentHeaderId { get; set; }
        public int CandidateID { get; set; }
        public int ApplicationID { get; set; }
        public int TotalTheory140 { get; set; }
        public int PracticalObservation230 { get; set; }
        public int PracticalViva80 { get; set; }
        public int TotalPractical310 { get; set; }
        public int GrandTotal450 { get; set; }
        public decimal Percentage { get; set; }
        public string Grade { get; set; }
    }

    /// <summary>KPI dashboard summary for a batch.</summary>
    public class STTDashboardDto
    {
        public int TotalCandidates { get; set; }
        public int Pending { get; set; }
        public int MarksEntered { get; set; }
        public int Absent { get; set; }
        public int Pass { get; set; }
        public int Fail { get; set; }
        public decimal AveragePercentage { get; set; }
    }

    /// <summary>Result returned by Save / Submit.</summary>
    public class STTSaveResult
    {
        public int AssessmentHeaderId { get; set; }
        public string Status { get; set; }
    }


}
