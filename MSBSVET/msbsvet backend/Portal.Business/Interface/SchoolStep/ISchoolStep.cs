using Portal.Business.Worker.Utility;
using Portal.Entities;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.SchoolStep
{
    public interface ISchoolStep
    {
        DataSet GetShortTermSchoolStepCourseUnitDetails(InstituteInputEntity entity);
        DataSet GetSTTSchoolUnitByInstitute(Int64 InstituteID);
        DataSet GetSTTSchoolBatchesByInstitute(Int64 UnitID);
        DataSet GetSTTSchoolBatchByBatchIDORUnitID(Int64 UnitID, Int64 BatchID);
        string InsertOrUpdateSTTSchoolBatchDetails(STTBatchEntity entity);
        string DeleteSTTSchoolBatchDetails(long batchId, string deletedBy, string ipAddress);
        DataSet InstituteSchoolAddSchool(SchoolInputEntity entity);
        int UpdateSchool(SchoolInputEntity entity);
        int SendSchoolForVerification(long schoolId, int modifiedBy, string ipAddress);
        int WithdrawVerificationRequest(long schoolId, int modifiedBy, string ipAddress);
        int VerifySchool(int schoolId, int verifiedBy, bool isApproved, string rejectionReason);
        DataSet GetSchoolsList(int instituteId, string filterStatus = null);
        DataSet GetSchoolDetails(int schoolId);
        DataSet GetVerifiedSchools(int instituteId);
        DataTable GetInstituteSchoolsWiseCourse(long schoolId);
        DataSet GetCandidateListByBatchID(long batchId);
        string ConfirmSchoolStepAdmission(long candidateId, string reportedBy, string reportedByIPAddress, long batchId);
        DataSet GetSTTBatchByBatchIDORUnitIDForSchoolBatch(Int64 UnitID, Int64 BatchID);


    }
}
