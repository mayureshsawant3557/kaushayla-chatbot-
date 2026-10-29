using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities.Certificate;

namespace Portal.Business.Interface.Certificate
{
    public interface IVerificationCertificateRequest
    {
        VerificationCertificateRequestEntity GetVerificationCertificateRequestByRequestNo(string requestNo);
    }


}
