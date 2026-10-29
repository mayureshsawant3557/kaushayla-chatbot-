using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Attendence
{
    public class RegularizationCreateRequest
    {
        public string RequestType { get; set; }       // PI-PunchIn PO-PunchOut

        public DateTime RequestedPunchDateTime { get; set; }

        public string PunchRemark { get; set; }

        public IFormFile? Selfie { get; set; }

        public decimal? Latitude { get; set; }

        public decimal? Longitude { get; set; }
    }
}
