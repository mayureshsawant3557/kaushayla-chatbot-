using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities 
{
    public class AadhaarVerifyResponse
    {
        public bool IsVerified { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? ReferenceNo { get; set; }
        public string? SubAUAtransId { get; set; }
        public string? ResponseTs { get; set; }
        public string? ResponseMsg { get; set; }
        public string? RawRet { get; set; }
        public string? RawResponse { get; set; }
        public AadhaarDemographics? Data { get; set; }
    }
}
