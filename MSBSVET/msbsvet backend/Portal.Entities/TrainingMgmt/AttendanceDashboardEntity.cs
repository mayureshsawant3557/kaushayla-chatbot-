using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class AttendanceSummaryEntity
    {
        public string ReportType { get; set; }
        public string BatchDate { get; set; }
        public string BatchDay { get; set; }
        public string AttendanceDate { get; set; }
        public int InstituteCount { get; set; }
        public int BatchCount { get; set; }
        public int AdmittedCount { get; set; }
        public int PresentCount { get; set; }
        public int AbsentCount { get; set; }
        public int AverageTrainingTimeInMinutes { get; set; }
        public decimal AdmittedPercentage { get; set; }
        public decimal PresentPercentage { get; set; }
        public decimal AbsentPercentage { get; set; }
        public string AverageTrainingTimeText { get; set; }
        public string BatchTimingRemark { get; set; }
    }
}
