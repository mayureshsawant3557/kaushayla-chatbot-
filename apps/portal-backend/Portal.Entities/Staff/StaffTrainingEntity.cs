using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Staff
{
    public class StaffTrainingEntity
    {
        public Int64 TrainingRowID { get; set; }
        public Int64 StaffID { get; set; }
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
