using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities
{
    public class CandidateUpdatedImageEntity
    {
        public string ProfileId { get; set; }
        public long CandidateId { get; set; }
        public string UpdatedProfilePhoto { get; set; }
        public string UpdatedSignPhoto { get; set; }
        public string IPAddress { get; set; }
        public string UserLoginId { get; set; }
    }
}
