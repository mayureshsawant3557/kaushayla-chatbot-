using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class ClientInfo
    {
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public string HostName { get; set; } = string.Empty;
        public string Browser { get; set; } = string.Empty;
        public string OperatingSystem { get; set; } = string.Empty;
        public string MachineId { get; set; } = string.Empty;
        public string RequestUrl { get; set; } = string.Empty;
        public string ReferrerUrl { get; set; } = string.Empty;
        public string RequestMethod { get; set; } = string.Empty;
        public bool IsSecureConnection { get; set; }
        public string AcceptLanguage { get; set; } = string.Empty;
        public bool IsLocalNetwork { get; set; }
    }
}
