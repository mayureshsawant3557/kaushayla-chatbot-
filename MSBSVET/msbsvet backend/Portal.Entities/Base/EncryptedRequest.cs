using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities 
{
    public class EncryptedRequest
    {
        public string EncryptedData { get; set; } = string.Empty;
        public string Iv { get; set; } = string.Empty;
        public string Tag { get; set; } = string.Empty;
    }

    public class EncryptedRequest2
    {
        public string encryptedData { get; set; } = string.Empty;
        public string iv { get; set; } = string.Empty;
        public string tag { get; set; } = string.Empty;
    }
}
