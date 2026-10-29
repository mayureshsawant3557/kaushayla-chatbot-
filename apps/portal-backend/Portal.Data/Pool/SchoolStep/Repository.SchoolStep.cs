using Portal.Entities;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet GetShortTermSchoolStepCourseUnitDetails(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UserLoginId", entity.UserLoginID ?? "");
            param.Add("@PageCode", entity.PageCode ?? "");
            param.Add("@CourseId", entity.ItemId);

            return _dbAccess.GetDataSet("Institute_GetShortTermSchoolCourseUnitDetails", param);

        }
        public DataSet GetSTTSchoolUnitByInstitute(Int64 InstituteID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@CollegeID", InstituteID);

            return _dbAccess.GetDataSet("Institute_GetSTTUnitByInstitute", param);
        }
        public DataSet GetSTTSchoolBatchesByInstitute(Int64 UnitID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UnitID", UnitID);

            return _dbAccess.GetDataSet("Institute_GetSTTBatchesByInstitute", param);
        }
        public DataSet GetSTTSchoolBatchByBatchIDORUnitID(Int64 UnitID, Int64 BatchID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UnitID", UnitID);
            param.Add("BatchID", BatchID);
            return _dbAccess.GetDataSet("Institute_GetSTTBatchByBatchIDORUnitID", param);
        }
        public string InsertOrUpdateSTTSchoolBatchDetails(STTBatchEntity entity)
        {
            var param = new Dictionary<string, object>();

            // Common parameters
            param.Add("@BatchID", entity.BatchId);   // NULL for insert
            param.Add("@UnitCode", entity.UnitId);
            param.Add("@Duration", entity.Duration);
            param.Add("@PerDayTraningHours", entity.PerDayHours);
            param.Add("@MinimumBatchDays", entity.MinBatchDays);
            param.Add("@BatchReservation", entity.BatchReservation);
            param.Add("@InstructorType", entity.InstructorType);
            param.Add("@CourseFeePernorms", entity.NormFees);
            param.Add("@ApplicableCourseFee", entity.ApplicableFees);
            param.Add("@SchemeID", entity.SchemeID);
            // Audit params
            param.Add("@CreatedBy", entity.CreatedBy);
            param.Add("@CreatedIpAddress", entity.CreatedIpAddress);

            // New fields
            param.Add("@CollegeID", entity.CollegeID);
            param.Add("@CourseID", entity.CourseID);
            param.Add("@ShiftID", entity.Shift);
            param.Add("@UnitNo", entity.Unit);

            param.Add("@BatchStartDate", entity.BatchStartDate);
            param.Add("@BatchEndDate", entity.BatchEndDate);
            param.Add("@AdmissionEndDate", entity.AdmissionLastDate);
            param.Add("@SchoolID", entity.SchoolID);

            return _dbAccess.ExecuteScalar("usp_InsertUpdate_Master_BatchDetails", param)?.ToString();
        }
        public string DeleteSTTSchoolBatchDetails(long batchId, string deletedBy, string ipAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", batchId);
            param.Add("@DeletedBy", deletedBy);
            param.Add("@DeletedIpAddress", ipAddress);

            // Call stored procedure
            var result = _dbAccess.ExecuteScalar("usp_Delete_Master_BatchDetails", param);

            return result?.ToString();
        }

        ///School Step 
        ///
        public DataSet InstituteSchoolAddSchool(SchoolInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", entity.InstituteId);
            param.Add("@UDISENo", entity.UDISENo ?? "");
            param.Add("@SchoolName", entity.SchoolName ?? "");
            param.Add("@Address", entity.Address ?? "");
            param.Add("@PinCode", entity.PinCode);
            param.Add("@CityID", entity.CityId);
            param.Add("@OtherCity", entity.OtherCity ?? "");
            param.Add("@Village", entity.Village ?? "");
            param.Add("@Taluka", entity.TalukaId);
            param.Add("@District", entity.DistrictId);
            param.Add("@MoUDate", entity.MoUDate);
            param.Add("@MoUExpiry", entity.MoUExpiry);
            param.Add("@MoUFilePath", entity.MoUFilePath ?? "");
            param.Add("@MoUFileName", entity.MoUFileName ?? "");
            param.Add("@SelectedCourses", entity.SelectedCourses ?? "");
            param.Add("@CreatedBy", entity.CreatedBy);
            param.Add("@IpAddress", entity.IpAddress ?? "");

            return _dbAccess.GetDataSet("Institute_sp_AddSchool", param);
        }
        public int UpdateSchool(SchoolInputEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", entity.SchoolID);
            param.Add("@UDISENo", entity.UDISENo ?? "");
            param.Add("@SchoolName", entity.SchoolName ?? "");
            param.Add("@Address", entity.Address ?? "");
            param.Add("@PinCode", entity.PinCode);
            param.Add("@CityID", entity.CityId);
            param.Add("@OtherCity", entity.OtherCity ?? "");
            param.Add("@Village", entity.Village ?? "");
            param.Add("@Taluka", entity.TalukaId);
            param.Add("@District", entity.DistrictId);
            param.Add("@MoUDate", entity.MoUDate);
            param.Add("@MoUExpiry", entity.MoUExpiry);
            param.Add("@MoUFilePath", entity.MoUFilePath ?? "");
            param.Add("@MoUFileName", entity.MoUFileName ?? "");
            param.Add("@SelectedCourses", entity.SelectedCourses ?? "");
            param.Add("@ModifiedBy", entity.CreatedBy);
            param.Add("@IpAddress", entity.IpAddress ?? "");

            return _dbAccess.ExecuteNonQuery("Institute_sp_UpdateSchool", param);
        }
        public int SendSchoolForVerification(long schoolId, int modifiedBy, string ipAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", schoolId);
            param.Add("@ModifiedBy", modifiedBy);
            param.Add("@IpAddress", ipAddress ?? "");

            return _dbAccess.ExecuteNonQuery("Institute_sp_SendSchoolForVerification", param);
        }
        public int WithdrawVerificationRequest(long schoolId, int modifiedBy, string ipAddress)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", schoolId);
            param.Add("@ModifiedBy", modifiedBy);
            param.Add("@IpAddress", ipAddress ?? "");

            return _dbAccess.ExecuteNonQuery(
                "Institute_sp_WithdrawVerificationRequest",
                param
            );
        }
        public int VerifySchool(int schoolId, int verifiedBy, bool isApproved, string rejectionReason)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", schoolId);
            param.Add("@VerifiedBy", verifiedBy);
            param.Add("@IsApproved", isApproved);
            param.Add("@RejectionReason", string.IsNullOrWhiteSpace(rejectionReason)
                                                ? (object)DBNull.Value
                                                : rejectionReason);

            return _dbAccess.ExecuteNonQuery("Institute_sp_VerifySchool", param);
        }
        public DataSet GetSchoolsList(int instituteId, string filterStatus = null)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", instituteId);
            param.Add("@FilterStatus", string.IsNullOrWhiteSpace(filterStatus)
                                            ? (object)DBNull.Value
                                            : filterStatus);

            return _dbAccess.GetDataSet("Institute_sp_GetSchoolsList", param);
        }
        public DataSet GetSchoolDetails(int schoolId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", schoolId);

            return _dbAccess.GetDataSet("Institute_sp_GetSchoolDetails", param);
        }
        public DataSet GetVerifiedSchools(int instituteId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@InstituteID", instituteId);

            return _dbAccess.GetDataSet("Institute_sp_GetVerifiedSchools", param);
        }
        public DataTable GetInstituteSchoolsWiseCourse(long schoolId)
        {
            var param = new Dictionary<string, object>();

            param.Add("@SchoolID", schoolId);

            return _dbAccess.GetDataTable("Institute_sp_GetSchoolsCourse", param);
            
        }
        public DataSet GetCandidateListByBatchID(long batchId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@BatchID", batchId);
            return _dbAccess.GetDataSet("Admission_GetCandidateListByBatchID", param);
        }
        public string ConfirmSchoolStepAdmission(long candidateId, string reportedBy, string reportedByIPAddress, long batchId)
        {
            var param = new Dictionary<string, object>();
            param.Add("@CandidateID", candidateId);
            param.Add("@ReportedBy", reportedBy);
            param.Add("@ReportedByIPAddress", reportedByIPAddress);
            param.Add("@BatchID", batchId);

            var result = _dbAccess.ExecuteScalar("Admission_ConfirmSchoolStepAdmission", param);
            return result?.ToString() ?? "N";
        }
        public DataSet GetSTTBatchByBatchIDORUnitIDForSchoolBatch(Int64 UnitID, Int64 BatchID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UnitID", UnitID);
            param.Add("@BatchID", BatchID);
            return _dbAccess.GetDataSet("Institute_GetSTTBatchByBatchIDORUnitIDForSchoolBatch", param);
        }

    }
}
