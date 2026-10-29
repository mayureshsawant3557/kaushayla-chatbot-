using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.TrainingMgmt;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.TrainingMgmt
{
    public interface IStaffAllocation
    {
        List<TrainingMgmtInstituteInfoEntity> GetInstituteInfo(TrainingMgmtInputEntity entity);
        List<CourseEntity> GetInstituteCourses(TrainingMgmtInputEntity entity);
        List<BatchEntity> GetCourseWiseBatches(TrainingMgmtInputEntity entity);
        List<StaffAllocationEntity> GetStaffAllocationDetails(TrainingMgmtInputEntity entity);
        DataSet GetSubjectStaffDetails(TrainingMgmtInputEntity entity);
        List<DropdownEntity> GetBatchwiseSubjectDetails(TrainingMgmtInputEntity entity);
        string AllocateStaff(TrainingMgmtInputEntity entity);
        string DeleteAllocatedStaff(TrainingMgmtInputEntity entity);

        // Batch Timing

        List<BatchTimingEntity> ImportBatchTiming(TrainingMgmtInputEntity entity);
        string UpdateBatchTimings(TrainingMgmtInputEntity entity, List<BatchTimingEntity> batchTimingEntity);

        // Attendance DashBoard
        List<AttendanceSummaryEntity> GetAttendanceSummaryData(TrainingMgmtInputEntity entity);

        List<CandidateAttendanceEntity> GetBatchwiseCandidates(TrainingMgmtInputEntity entity);

    }
}
