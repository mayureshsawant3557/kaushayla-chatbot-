using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class AadhaarApiResponse
    {
        public string? DeviceId { get; set; }
        public string? SubAUAtransId { get; set; }
        public string? Ret { get; set; }
        public string? ResponseMsg { get; set; }
        public string? ResponseTs { get; set; }
        public string? refNum { get; set; }
    }
}
