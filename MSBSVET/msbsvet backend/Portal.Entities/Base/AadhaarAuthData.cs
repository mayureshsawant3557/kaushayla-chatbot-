using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class AadhaarAuthData
    {
        public string username { get; set; } = string.Empty;
        public string password { get; set; } = string.Empty;
        public string access_token { get; set; } = string.Empty;
        public string user { get; set; } = string.Empty;
    }
}
