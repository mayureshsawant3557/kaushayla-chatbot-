using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Candidate
{
    public class MainCourseApplyEntity
    {
        public long CandidateID { get; set; }
        public int MainCourseID { get; set; }
        public string MainCourseName { get; set; }
        public int AdmissionYearID { get; set; }
        public long ApplicationID { get; set; }
        public string ProfileID { get; set; }
        public int IsUnlock { get; set; }
        public int IsLock { get; set; }
        public int IsApplied { get; set; }
        public int IsFeePaid { get; set; }
        public int IsAdmittd { get; set; }
        public string AmountPaid { get; set; }
        public string ApplicationIDDisplay { get; set; }
        public string PaymentStatus { get; set; }
        public string PaymentDate { get; set; }
        public string ResponseUrl { get; set; }
        public int IsExpire { get; set; }
        public string ReportingStatus { get; set; }

        public string LastModifiedOn { get; set; }
        public int IsSTT { get; set; }
        public string OptionsLink { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        //public string CourseNameCode { get; set; }
        //public string InstituteNameCode { get; set; }
        //public string Result { get; set; }
    }
}
