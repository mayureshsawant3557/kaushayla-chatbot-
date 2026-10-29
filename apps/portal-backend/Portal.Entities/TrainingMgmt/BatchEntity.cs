using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class BatchEntity
    {
        public Int64 InstituteId { get; set; }
        public string InstituteCode { get; set; }
        public string InstituteName { get; set; }
        public Int64 CourseId { get; set; }
        public string CourseName { get; set; }
        public string CourseCode { get; set; }
        public Int64 BatchId { get; set; }
        public string Batch { get; set; }
        public string BatchCode { get; set; }
        public string BatchStartDate { get; set; }
        public string AdmissionLastDate { get; set; }
        public string BatchEndDate { get; set; }
        public string HallTicketIssueDate { get; set; }
        public string ExamStartDate { get; set; }
        public string ExamType { get; set; }
        public string BatchStatus { get; set; }
        public bool IsBatchCompleted { get; set; }
        public int AdmittedCount { get;set; }     
        public int ApprovedCount { get; set; }
        public int RejectedCount { get; set; }
    }
}
