using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
    public class BCLSPrintRequestCertificate
    {
        public List<long> CertificateIds { get; set; }
        public int ExaminationId { get; set; } = 0;
        public string IsResultFresh { get; set; } = "F";
    }
}
