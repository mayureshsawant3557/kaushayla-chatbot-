using Portal.Business.Interface.Exam;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.ReportGenerator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Report
{
    public class VerificationCertificateWorker : IVerificationCertificate
    {
        // Repository objData = new Repository();
        private readonly Repository objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public VerificationCertificateWorker(Repository objData)
        {
            this.objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public string SaveVerificationCertificateRequest(VerificationCertificateEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveVerificationCertificateRequest(entity);
                if (retVal.ToUpper() == "N" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveVerificationCertificateRequest", entity.UserLoginID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataSet GetVerificationCertificateRequests(string status)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetVerificationCertificateRequests(status);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetVerificationCertificateRequests Status:" + status);
                throw ex;
            }
            return ds;
        }

        public DataSet CheckIsPreviouslyVerified(string certificateNo, string profileID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.CheckIsPreviouslyVerified(certificateNo,profileID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckIsPreviouslyVerified CertificateNo:" + certificateNo);
                throw ex;
            }
            return ds;
        }

        public int UpdateCertificateStatus(String profileID, string status, string updatedBy, DateTime? printedOn)
        {
            int result = 0;
            try
            {
                result = objData.UpdateCertificateStatus(profileID, status, updatedBy, printedOn);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateCertificateStatus ProfileID:" + profileID.ToString() + " Status:" + status);
                throw ex;
            }
            return result;
        }

    }

}
