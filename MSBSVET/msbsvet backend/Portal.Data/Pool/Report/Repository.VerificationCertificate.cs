using Portal.Data.Source;
using Portal.Entities.ReportGenerator;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {


        public string SaveVerificationCertificateRequest(VerificationCertificateEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ProfileID", entity.ProfileID);
            param.Add("@Name", entity.Name);
            param.Add("@Designation", entity.Designation);
            param.Add("@OrganizationName", entity.OrganizationName);
            param.Add("@OrganizationAddress", entity.OrganizationAddress);
            param.Add("@PinCode", entity.PinCode);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);
            param.Add("@CityID", entity.CityID);
            param.Add("@PrimaryMobile", entity.PrimaryMobile);
            param.Add("@OtpVerified", entity.OtpVerified);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            // Add update-specific parameters
            param.Add("@RequestNo", entity.RequestNo);
            param.Add("@PaymentStatus", entity.PaymentStatus);
            param.Add("@TransactionID", entity.TransactionID);
            param.Add("@FeeAmount", entity.FeeAmount);
            param.Add("@Status", entity.Status);
            param.Add("@IsUpdate", entity.IsUpdate);

            return _dbAccess.ExecuteScalar("RequestSignedVerificationCertificate", param).ToString();
        }

    }
}
