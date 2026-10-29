using Microsoft.AspNetCore.Http;
using Portal.Entities.Attendence;

namespace Portal.Business.Interface.Attendance
{
    public interface IPythonService
    {
        Task<ServiceResult<string>> GetFaceEncodingFromImageUrl(string ImageUrl);
        Task<ServiceResult<string>> GetFaceEncodingFromImage(IFormFile Image);
        Task<ServiceResult<object>> CompareEncodings(string encoding1, string encoding2);
        Task<ServiceResult<object>> CheckIsHumanFace(IFormFile image);
    }
}
