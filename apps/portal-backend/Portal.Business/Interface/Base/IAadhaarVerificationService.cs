using Portal.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Base
{
    public interface IAadhaarVerificationService
    {
        Task<AadhaarVerifyResponse> VerifyAsync(AadhaarVerifyRequest request, CancellationToken ct = default);
        Task<AadhaarReVerifyResponse> ReVerifyAsync(AadhaarReVerifyRequest request, CancellationToken ct = default);
    }
}
