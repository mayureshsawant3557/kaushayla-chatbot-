using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class CandidateInput
    {
        public Int64 CandidateID { get; set; }
        public string UserLoginID { get; set; }
        public string PageCode { get; set; }
        public string IPAddress { get; set; }
    }
}
