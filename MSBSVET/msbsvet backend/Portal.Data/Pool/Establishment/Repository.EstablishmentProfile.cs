using Portal.Entities;
using Portal.Entities.Establishment;
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
        public DataTable GetEstablishmentProfile(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetProfile", param);
        }
        public string SaveEstablishmentProfile(EstablishmentProfileEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@NAPSRegistrationID", entity.NAPSRegistrationID);
            param.Add("@NAPSEstablishmentName", entity.NAPSEstablishmentName);
            param.Add("@EstablishmentTypeID", entity.EstablishmentTypeID);
            param.Add("@OtherEstablishmentType", entity.OtherEstablishmentType);
            param.Add("@RegistrationNo", entity.RegistrationNo);
            param.Add("@RegistrationDate", entity.RegistrationDate);
            param.Add("@EstablishmentName", entity.EstablishmentName);
            param.Add("@RegistrationCertificatePath", entity.RegistrationCertificatePath);
            param.Add("@OperationsSector", entity.OperationsSector);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveProfile", param).ToString();
        }
    }
}
