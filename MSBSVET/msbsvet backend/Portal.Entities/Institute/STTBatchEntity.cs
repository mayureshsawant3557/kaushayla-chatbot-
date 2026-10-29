using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Institute
{
    public class STTBatchEntity
    {
        public string BatchId { get; set; }
        public string BatchStatus { get; set; }
        public string Course { get; set; }
        public string Shift { get; set; }
        public string Unit { get; set; }
        public string UnitId { get; set; }
        public string CourseType { get; set; }
        public int Duration { get; set; } // in days
        public int PerDayHours { get; set; }
        public int MinBatchDays { get; set; }

        public DateTime BatchStartDate { get; set; }
        public DateTime BatchEndDate { get; set; }
        public DateTime AdmissionLastDate { get; set; }

        public int BatchReservation { get; set; }
        public int InstructorType { get; set; }

        public Int32 NormFees { get; set; }
        public Int32 ApplicableFees { get; set; }

        public int Intake { get; set; }
        public int Admitted { get; set; }
        public int Vacant { get; set; }

        public int Passed { get; set; }
        public int Failed { get; set; }
        public int Absent { get; set; }


        public string CreatedBy { get; set; }
        public string CreatedIpAddress { get; set; }

        public long CollegeID { get; set; }
        public long CourseID { get; set; }
        public int SchemeID { get; set; }
        public int SchoolID { get; set; }


    }
}
