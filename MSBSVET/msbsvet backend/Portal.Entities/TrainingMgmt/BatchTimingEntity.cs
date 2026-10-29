using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class BatchTimingEntity
    {
        public Int64 BatchTimingDateId { get; set; }    
        public Int64 InstituteId { get; set; }       
        public Int64 BatchId { get; set; }
        //public string Batch { get; set; }
        public string BatchDate { get; set; }
        public short BatchTimingRemarkId { get; set; }
        public string BatchTimingRemark { get; set; }
        public string BatchStartTime { get; set; }
        public string BatchEndTime { get; set; }
        public string BatchDuration { get; set; }
        public string BatchDay { get; set; }        

    }
}
