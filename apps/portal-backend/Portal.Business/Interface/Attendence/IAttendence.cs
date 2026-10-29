using Microsoft.AspNetCore.Http;
using Portal.Entities.Attendance;
using Portal.Entities.Attendence;
using Portal.Entities.FirebaseNotification;
using System.Data;

namespace Portal.Business.Interface.Attendance
{
    public interface IAttendance
    {
        Task<ServiceResult<object>> EnrollFace(long userId, FaceEnrollmentRequest request);
        Task<ServiceResult<object>> ReEnrollFace(long userId, FaceEnrollmentRequest request);
        Task<ServiceResult<object>> PunchIn(long userId, PunchInRequest request, string ipAddress);
        Task<ServiceResult<object>> PunchOut(long userId, PunchOutRequest request, string ipAddress);

        // Attendance Management
        ServiceResult<object> GetTodayAttendance(long userId);
        object GetAttendanceCalendar(long userId, int? year, int? month);
        object GetWeeklyStatistics(long userId);
        object GetAttendanceHistory(long userId, DateTime? startDate, DateTime? endDate);
        ServiceResult<object> GetMonthlyStatistics(long userId, int? year, int? month);
        object GetUserInstituteLocation(long userId);

        // Face Recognition
        object GetFaceEnrollmentStatus(long userId);
        void DeleteFaceEnrollment(long userId);

        // Add photo upload method
        Task<ServiceResult<PhotoUploadResult>> UploadPhoto(long userId, IFormFile photo, bool checkIsHuman = true);
        // User Management
        object GetUserProfile(long userId, int userTypeId);

        ServiceResult<object> Dashboard(long userId, int userTypeId);
        string UpdateProfilePhoto(long userId, string photoUrl);


        // Location Validation
        object ValidateLocation(long userId, double latitude, double longitude);

        // Attendance Regularization
        Task<ServiceResult<object>> CreateRegularization(long userId, RegularizationCreateRequest request);
        Task<ServiceResult<object>> ProcessRegularization(List<long> requestId, int action, string approveBy, string approvalRemark = "");
        Task<ServiceResult<object>> GetUserRegularization(long userId, int? approvalStatus);
        Task<ServiceResult<object>> GetInstituteRegularization(string collegeLoginId, long userTypeId, int? approvalStatus);


        Task<ServiceResult<object>> GetInstituteSummaryByDate(string InstituteCode, long userTypeId, long courseId, long batchId,DateTime? attendanceDate);
       
    }
}
