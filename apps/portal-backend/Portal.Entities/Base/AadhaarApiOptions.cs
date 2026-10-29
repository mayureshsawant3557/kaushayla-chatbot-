using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class AadhaarApiOptions
    {
        public const string SectionName = "AadhaarApi";

        public string BaseUrl { get; set; } = "https://rojgar.mahaswayam.gov.in/api/aadhar_authentication";
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string User { get; set; } = "MSSDS";
        public int TimeoutMs { get; set; } = 30_000;
    }
}
