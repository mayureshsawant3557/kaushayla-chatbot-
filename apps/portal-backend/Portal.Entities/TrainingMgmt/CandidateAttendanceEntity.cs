using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.TrainingMgmt
{
    public class CandidateAttendanceEntity
    {
        public Int64 BatchId { get; set; }
        public string Batch { get; set; }
        public string BatchCode { get; set; }
        public Int64 CandidateId { get; set; }
        public string CandidateProfileId { get; set; }
        public string CandidateName { get; set; }

        public List<CandidateDaywiseAttendanceEntity> lstCandidateDaywiseAttendance { get; set; }

        public CandidateAttendanceEntity()
        {
            BatchId = 0;
            CandidateId = 0;
            Batch = "";
            BatchCode = "";
            CandidateProfileId = "";
            CandidateName = "";
            lstCandidateDaywiseAttendance = new List<CandidateDaywiseAttendanceEntity>();
        }
    }
    public class CandidateDaywiseAttendanceEntity
    {
        public Int64 BatchTimingDateId { get; set; }        
        public string BatchDate { get; set; }
        public short BatchTimingRemarkId { get; set; }
        public string BatchTimingRemark { get; set; }       
        public string BatchDay { get; set; }
        public string PunchInDateTime { get; set; }
        public string PunchOutDateTime { get; set; }
        public string PunchInReasonId { get; set; }
        public string PunchOutReasonId { get; set; }
        public string PunchInReason { get; set; }
        public string PunchOutReason { get; set; }
        public int TrainingDuration { get; set; }
        public short InstituteRemarkId { get; set; }
        public string InstituteRemark { get; set; }
        public short DVTORemarkId { get; set; }
        public string DVTORemark { get; set; }
        public short BoardRemarkId { get; set; }
        public string BoardRemark { get; set; }
        public bool IsEditAllowed { get; set; }
    }
}
