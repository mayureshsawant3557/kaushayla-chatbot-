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
        public DataTable GetEstablishmentAddress(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetAddress", param);
        }
        public string SaveEstablishmentAddress(EstablishmentAddressEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);            
            param.Add("@AddressLine1", entity.AddressLine1);
            param.Add("@AddressLine2", entity.AddressLine2);
            param.Add("@StateID", entity.StateID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@TalukaID", entity.TalukaID);         
            param.Add("@CityID", entity.CityID);
            param.Add("@OtherCity", entity.OtherCity);
            param.Add("@Pincode", entity.Pincode);
            param.Add("IsPincodeCorrect", entity.IsPincodeCorrect);
            param.Add("@PhoneNo", entity.PhoneNo);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@GoogleMapLocation", entity.GoogleMapLocation);            
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveAddress", param).ToString();
        }
    }
}
