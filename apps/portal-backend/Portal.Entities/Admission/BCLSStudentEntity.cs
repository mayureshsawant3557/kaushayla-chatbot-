using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Admission
{
    public class BCLSStudentEntity
    {
        public long ID { get; set; }
        public long CandidateID { get; set; }
        public long ApplicationID { get; set; }
        public long UserID { get; set; }
        public int CourseID { get; set; }
        public string LoginURL { get; set; }
        public int Enrolled { get; set; }
        public string IpAddress { get; set; }
        public string CreatedBy { get; set; }
        public long MSBVCourseID { get; set; }
        public string Email { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Username { get; set; }
        public string TempPassword { get; set; }
        public string UniqueId { get; set; }
        public string Institution { get; set; }
        public string Department { get; set; }
        public string WantsUrl { get; set; }
        public string Mode { get; set; }
        public string Enrol { get; set; }

        // Store full JSON for logs/debugging
        public string ApiResponseRaw { get; set; }

        // Store parsed response
        public ApiResponseModel ApiResponse { get; set; }

    }
    //public class ApiResponseModel
    //{
    //    public string Status { get; set; }
    //    public int UserId { get; set; }
    //    public string LoginUrl { get; set; }
    //    public bool Enrolled { get; set; }
    //    public int CourseId { get; set; }
    //}
}
