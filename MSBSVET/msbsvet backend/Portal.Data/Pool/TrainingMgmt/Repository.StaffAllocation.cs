using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Net;
using System.Text;
using Portal.Data.Source;
using Portal.Entities;
using Newtonsoft.Json;
using Portal.Entities.TrainingMgmt;


namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet GetInstituteInfo(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
           
            return _dbAccess.GetDataSet("TrainingMgmt_GetInstituteInfo", parms);
        }
        public DataSet GetInstituteCourses(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@BatchType", entity.BatchType);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);


            return _dbAccess.GetDataSet("TrainingMgmt_GetInstituteCourses", parms);
        }
        public DataSet GetCourseWiseBatches(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
             parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);

            return _dbAccess.GetDataSet("TrainingMgmt_GetCourseWiseBatches", parms);
        }
        public DataSet GetStaffAllocationDetails(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@StaffProfileId", entity.StaffProfileId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);

            return _dbAccess.GetDataSet("TrainingMgmt_GetStaffAllocationDetails", parms);
        }

        public DataSet GetSubjectStaffDetails(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@StaffProfileId", entity.StaffProfileId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);

            return _dbAccess.GetDataSet("TrainingMgmt_GetSubjectStaffDetails", parms);
        }

        public DataSet GetBatchwiseSubjectDetails(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);            
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);

            return _dbAccess.GetDataSet("TrainingMgmt_GetBatchwiseSubjectDetails", parms);
        }
        public string AllocateStaff(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@StaffProfileId", entity.StaffProfileId);
            parms.Add("@SubjectId", entity.SubjectId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);
            parms.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("TrainingMgmt_AllocateStaff", parms).ToString();
        }

        public string DeleteAllocatedStaff(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);            
            parms.Add("@AssignmentId", entity.ItemId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("TrainingMgmt_DeleteAllocatedStaff", parms).ToString();
        }



        /// Batch Timing
        /// 

        public DataSet ImportBatchTiming(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);            
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@IPAddress", entity.IPAddress);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);


            return _dbAccess.GetDataSet("TrainingMgmt_ImportBatchTiming", parms);
        }
        public string UpdateBatchTimings(TrainingMgmtInputEntity entity, List<BatchTimingEntity> batchTimingEntity)
        {
           string BatchTimingXML =  GetXML(batchTimingEntity);

            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@IPAddress", entity.IPAddress);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);
            parms.Add("@BatchTimingXML", BatchTimingXML);

            //parms.Add("@BatchDate", batchTimingEntity.BatchDate);
            //parms.Add("@BatchStartTime", batchTimingEntity.BatchStartTime);
            //parms.Add("@BatchEndTime", batchTimingEntity.BatchEndTime);
            //parms.Add("@BatchTimingRemarkId", batchTimingEntity.BatchTimingRemarkId);
            //parms.Add("@BatchTimingRemark", batchTimingEntity.BatchTimingRemark);

            return _dbAccess.ExecuteScalar("TrainingMgmt_UpdateBulkBatchTimings", parms).ToString();
        }

        /// Attendance DashBoard

        public DataSet GetAttendanceSummaryData(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);            
            parms.Add("@CourseID", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@ReportDate", entity.ReportDate);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);
            
            return _dbAccess.GetDataSet("TrainingMgmt_GetAttendanceSummaryData", parms);
        }

        /// Batch wise Candidate
        /// 

        public DataSet GetBatchwiseCandidates(TrainingMgmtInputEntity entity)
        {
            var parms = new Dictionary<string, object>();

            parms.Add("@InstituteId", entity.InstituteId);            
            parms.Add("@CourseId", entity.CourseID);
            parms.Add("@BatchId", entity.BatchId);
            parms.Add("@CandidateId", entity.CandidateId);
            parms.Add("@userLoginId", entity.UserLoginID);
            parms.Add("@PageCode", entity.PageCode);
            parms.Add("@Code", entity.ItemId);

            return _dbAccess.GetDataSet("TrainingMgmt_GetBatchwiseCandidates", parms);
        }
    }
}
