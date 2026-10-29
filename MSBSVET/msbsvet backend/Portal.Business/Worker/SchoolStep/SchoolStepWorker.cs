using Portal.Business.Interface.Institute;
using Portal.Business.Interface.SchoolStep;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static iTextSharp.text.pdf.events.IndexEvents;

namespace Portal.Business.Worker
{
    public class SchoolStepWorker : ISchoolStep
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public SchoolStepWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public DataSet GetShortTermSchoolStepCourseUnitDetails(InstituteInputEntity entity)
        {
            try
            {
                return objData.GetShortTermSchoolStepCourseUnitDetails(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetShortTermSchoolStepCourseUnitDetails", entity.InstituteId.ToString());
                throw;
            }
        }

        public DataSet GetSTTSchoolUnitByInstitute(Int64 InstituteID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSTTSchoolUnitByInstitute(InstituteID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTUnitByInstitute" + InstituteID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataSet GetSTTSchoolBatchesByInstitute(Int64 UnitID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSTTSchoolBatchesByInstitute(UnitID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTSchoolBatchesByInstitute" + UnitID.ToString());
                throw ex;
            }
            return ds;
        }
        public DataSet GetSTTSchoolBatchByBatchIDORUnitID(Int64 UnitID, Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSTTSchoolBatchByBatchIDORUnitID(UnitID, BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTSchoolBatchByBatchIDORUnitID " + UnitID.ToString() + " : " + BatchID.ToString());
                throw ex;
            }
            return ds;
        }
        public string InsertOrUpdateSTTSchoolBatchDetails(STTBatchEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.InsertOrUpdateSTTSchoolBatchDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertOrUpdateSTTSchoolBatchDetails", entity.BatchId);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string DeleteSTTSchoolBatchDetails(long batchId, string deletedBy, string ipAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteSTTSchoolBatchDetails(batchId, deletedBy, ipAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteSTTBatchDetails", batchId.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataSet InstituteSchoolAddSchool(SchoolInputEntity entity)
        {
            try
            {
                return objData.InstituteSchoolAddSchool(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InstituteSchoolAddSchool", entity.InstituteId.ToString());
                throw;
            }
        }
        public int UpdateSchool(SchoolInputEntity entity)
        {
            int retVal = 0;
            try
            {
                retVal = objData.UpdateSchool(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateSchool", entity.SchoolID.ToString());
                throw ex;
            }
            return retVal;
        }
        public int SendSchoolForVerification(long schoolId, int modifiedBy, string ipAddress)
        {
            int retVal = 0;
            try
            {
                retVal = objData.SendSchoolForVerification(schoolId, modifiedBy, ipAddress);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SendSchoolForVerification", schoolId.ToString());
                throw ex;
            }
            return retVal;
        }
        public int WithdrawVerificationRequest(long schoolId, int modifiedBy, string ipAddress)
        {
            int retVal = 0;
            try
            {
                retVal = objData.WithdrawVerificationRequest(
                    schoolId,
                    modifiedBy,
                    ipAddress
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "WithdrawVerificationRequest",
                    schoolId.ToString()
                );
                throw;
            }

            return retVal;
        }
        public int VerifySchool(int schoolId, int verifiedBy, bool isApproved, string rejectionReason)
        {
            int retVal = 0;
            try
            {
                retVal = objData.VerifySchool(schoolId, verifiedBy, isApproved, rejectionReason);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "VerifySchool", schoolId.ToString());
                throw ex;
            }
            return retVal;
        }
        public DataSet GetSchoolsList(int instituteId, string filterStatus = null)
        {
            try
            {
                return objData.GetSchoolsList(instituteId,filterStatus);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSchoolsList", instituteId.ToString());
                throw;
            }
        }
        public DataSet GetSchoolDetails(int schoolId)
        {
            try
            {
                return objData.GetSchoolDetails(schoolId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSchoolDetails", schoolId.ToString());
                throw;
            }

        }
        public DataSet GetVerifiedSchools(int instituteId)
        {
            try
            {
                return objData.GetVerifiedSchools(instituteId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetVerifiedSchools", instituteId.ToString());
                throw;
            }
        }
  public DataTable GetInstituteSchoolsWiseCourse(long schoolId)
        {
            try
            {
                return objData.GetInstituteSchoolsWiseCourse(schoolId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteSchoolsWiseCourse", schoolId.ToString());
                throw;
            }
        }
        public DataSet GetCandidateListByBatchID(long batchId)
        {
            try
            {
                return objData.GetCandidateListByBatchID(batchId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateListByBatchID", batchId.ToString());
                throw;
            }
        }
        public string ConfirmSchoolStepAdmission(long candidateId, string reportedBy, string reportedByIPAddress, long batchId)
        {
            try
            {
                return objData.ConfirmSchoolStepAdmission(candidateId, reportedBy, reportedByIPAddress, batchId);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ConfirmSchoolStepAdmission", candidateId.ToString());
                throw;
            }
        }
        public DataSet GetSTTBatchByBatchIDORUnitIDForSchoolBatch(Int64 UnitID, Int64 BatchID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetSTTBatchByBatchIDORUnitIDForSchoolBatch(UnitID, BatchID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTBatchByBatchIDORUnitIDForSchoolBatch" + UnitID.ToString() + " : " + BatchID.ToString());
                throw ex;
            }
            return ds;
        }
    }
}
