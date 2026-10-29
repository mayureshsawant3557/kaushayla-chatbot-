using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
    public class BCLSPrintSelectedSystemRequest
    {
        public int ExaminationId { get; set; }

        public string IsResultFresh { get; set; }

        public List<long> CertificateIds { get; set; }
    }
}
