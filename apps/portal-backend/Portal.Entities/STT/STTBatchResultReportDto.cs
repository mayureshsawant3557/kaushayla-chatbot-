using System;
using System.ComponentModel.DataAnnotations;

namespace Portal.Entities
{
    /* =========================================================================
       Module : STT -> Batch Result Report
       File   : Portal.Entities/STT/STTBatchResultReportDto.cs
       Purpose: Request DTOs for the STT Batch Result report. Mirrors the STT
                feature convention (namespace Portal.Entities, DataAnnotations).
                Responses are returned as raw DataTable/DataSet inside
                ApiResponse<T>, exactly like the existing STT read endpoints.
       ========================================================================= */

    /// <summary>
    /// Filters + role scope + optional server paging for the batch grid / KPIs.
    /// Role scoping (UserTypeId 61/13/14) is applied by the client supplying the
    /// forced id(s); 0 / null means "no filter". PageSize 0 => return all rows.
    /// </summary>
    public class STTBatchResultReportRequest
    {
        public int UserTypeID { get; set; }
        public string UserLoginID { get; set; }

        // Filters
        public long AgencyId { get; set; }
        public string Status { get; set; }
        public int RegionID { get; set; }
        public int DistrictID { get; set; }
        public int TalukaID { get; set; }
        public long InstituteID { get; set; }
        public int CourseID { get; set; }

        // Server-side paging / sorting / searching (optional).
        public string SearchText { get; set; }
        public string SortColumn { get; set; }
        public string SortDirection { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    /// <summary>Drill-down request: candidates of a single batch (lazy loaded).</summary>
    public class STTBatchCandidateReportRequest
    {
        [Required]
        public long BatchID { get; set; }
        public int UserTypeID { get; set; }
        public string UserLoginID { get; set; }

        public string SearchText { get; set; }
        public string SortColumn { get; set; }
        public string SortDirection { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }

    /// <summary>Save the certificate "Printed On" / "Dispatched On" date of a
    /// batch (ExamSTT_AssessmentHeader.PrintDate / DispatchDate). The two update
    /// endpoints share this DTO; each fills only its own date. ModifiedBy /
    /// ModifiedIP are filled server-side from the JWT + connection.</summary>
    public class STTBatchCertificateDateRequest
    {
        [Required]
        public long BatchID { get; set; }
        public DateTime? PrintedDate { get; set; }
        public DateTime? DispatchDate { get; set; }

        // Nullable: Portal.Entities builds with <Nullable>enable</Nullable>, and
        // MVC treats non-nullable reference properties as implicitly [Required] —
        // the client never sends these (they are filled from the JWT/connection
        // after binding), so non-nullable here fails model validation with 400.
        public string? ModifiedBy { get; set; }
        public string? ModifiedIP { get; set; }
    }
}
