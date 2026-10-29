using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class AadhaarReVerifyRequest
    {
        public long CandidateId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string FatherName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Dob { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string AadhaarNo { get; set; } = string.Empty;
        public string UserLoginId { get; set; } = string.Empty;
    }
}

