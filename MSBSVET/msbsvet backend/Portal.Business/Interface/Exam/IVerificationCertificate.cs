using Portal.Entities.ReportGenerator;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Exam
{
    public interface IVerificationCertificate
    {
        string SaveVerificationCertificateRequest(VerificationCertificateEntity entity);
        DataSet GetVerificationCertificateRequests(string status);
        int UpdateCertificateStatus(String profileID, string status, string updatedBy, DateTime? printedOn);
        DataSet CheckIsPreviouslyVerified(string certificateNo, string profileID);



    }
}
