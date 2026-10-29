using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class CandidateTrainingEntity
    {
        public Int64 TrainingRowID { get; set; }
        public Int64 CandidateID { get; set; }
        public string Course { get; set; }
        public string CourseConductedBy { get; set; }
        public DateTime FromDate { get; set; }
        public string FromDateStr { get; set; }
        public DateTime ToDate { get; set; }
        public string ToDateStr { get; set; }
        public string CertificatePath { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string IsTraningAvailable { get; set; }

    }
}
