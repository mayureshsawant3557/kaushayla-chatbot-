using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Exam
{
    public class MasterExaminationEntity
    {

        public string ExaminationName { get; set; }
        public int ExaminatioYearID { get; set; }
        public DateTime HallTicketDate { get; set; }
        public string ResultExaminationName { get; set; }
        public int ExamTypeID { get; set; }

        public long ID { get; set; }
        public bool IsUpdate { get; set; }

        public bool IsRepeater { get; set; }
        public string? ModifiedBy { get; set; }
        public string? ModifiedByIPAddress { get; set; }
    }
}
