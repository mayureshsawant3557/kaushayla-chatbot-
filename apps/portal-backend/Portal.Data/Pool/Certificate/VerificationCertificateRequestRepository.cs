using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Data.Source;
using Portal.Entities.Certificate;

namespace Portal.Data.Pool.Certificate
{
    public class VerificationCertificateRequestRepository
    {
        private readonly DatabaseAccess _dbAccess;

        public VerificationCertificateRequestRepository(DatabaseAccess dbAccess)
        {
            _dbAccess = dbAccess ?? throw new ArgumentNullException(nameof(dbAccess));
        }

        public DataTable GetVerificationCertificateRequestByRequestNo(string requestNo)
        {
            if (string.IsNullOrWhiteSpace(requestNo))
            {
                throw new ArgumentException("RequestNo cannot be null or empty.", nameof(requestNo));
            }

            var param = new Dictionary<string, object>
        {
            { "@RequestNo", requestNo.Trim() }
        };

            return _dbAccess.GetDataTable("VerificationCertificateRequests_GetByRequestNo", param);
        }
    }


}
