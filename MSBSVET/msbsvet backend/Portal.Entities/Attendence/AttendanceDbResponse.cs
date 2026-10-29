
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.AttendanceDbResponse
{
    public class DbResponse<T>
    {
        public string Result { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }   // optional
    }



}

public class FaceEncodingDto
{
    public bool FaceEnrolled { get; set; }
    public string? FaceEncodingData { get; set; }
    public string? FaceImageUrl { get; set; }
    public DateTime? EnrollmentDate { get; set; }
}

public class PunchInDto
{
    public string AttendanceDate { get; set; }
    public string PunchInTime { get; set; }
    public string PunchOutTime { get; set; }
    public decimal TotalHours { get; set; }

    public string AttendanceStatus { get; set; }
    public string DailyPlan { get; set; }
    public string WorkSummary { get; set; }

    public string PunchInRemark { get; set; }
    public string PunchOutRemark { get; set; }

    public decimal PunchInDistanceFromOffice { get; set; }
    public decimal? PunchOutDistanceFromOffice { get; set; }

    public bool IsPunchInValid { get; set; }
    public bool? IsPunchOutValid { get; set; }

    public bool CanPunchOut { get; set; }
    public bool CanPunchIn { get; set; }

    public string FaceVerificationStatus { get; set; }

    public long RecordId { get; set; }

    public string LocationValidationMessage { get; set; }
}

public class InstituteTodaySummaryResponse
{
    public long TotalCount { get; set; }

    public long PunchOut { get; set; }

    public long PunchIn { get; set; }

    public long Remaining { get; set; }

    public List<AttendanceUserResponse> Details { get; set; }
}

public class AttendanceUserResponse
{
    public long UserID { get; set; }

    public string UserName { get; set; }
    public string UserLoginID { get; set; }

    public DateTime? PunchIn { get; set; }

    public DateTime? PunchOut { get; set; }

    public string AttendanceStatus { get; set; }
    public decimal? PunchInLatitude { get; set; }
    public decimal? PunchInLongitude { get; set; }
    public decimal? PunchOutLatitude { get; set; }
    public decimal? PunchOutLongitude { get; set; }
}