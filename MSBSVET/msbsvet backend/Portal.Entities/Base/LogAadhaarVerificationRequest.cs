using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class LogAadhaarVerificationRequest
    {
        public long CandidateId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string AadhaarNo { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public string? ReferenceNo { get; set; }
        public string? SubAUAtransId { get; set; }
        public string? ResponseTs { get; set; }
        public string? ResponseMsg { get; set; }
        public string? RawRet { get; set; }
        public string? RawResponse { get; set; }
        public string UserLoginId { get; set; } = string.Empty;
        public string IpAddress { get; set; } = string.Empty;
    }
}
