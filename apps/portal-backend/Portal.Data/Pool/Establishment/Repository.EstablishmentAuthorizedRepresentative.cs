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
        public DataTable GetEstablishmentAuthorizedRepresentative(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetAuthorizedRepresentative", param);
        }
        public string SaveEstablishmentAuthorizedRepresentative(EstablishmentAuthorizedRepresentativeEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@Title", entity.Title);
            param.Add("@FullName", entity.NAPSCandidateName);
            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@Designation", entity.Designation);
            param.Add("@GenderCode", entity.GenderCode);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@AlternateMobileNo", entity.AlternateMobileNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveAuthorizedRepresentative", param).ToString();
        }
    }
}
