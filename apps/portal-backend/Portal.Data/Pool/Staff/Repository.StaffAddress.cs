using Portal.Entities;
using Portal.Entities.Staff;
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
        public DataTable GetStaffAddress(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_GetAddress", param);
        }
        public string SaveStaffAddress(StaffAddressEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@PAddress", entity.PAddress);
            param.Add("@PStateID", entity.PStateID);
            param.Add("@PDistrictID", entity.PDistrictID);
            param.Add("@PTalukaID", entity.PTalukaID);
            param.Add("@PCityID", entity.PCityID);
            param.Add("@POtherCity", entity.POtherCity);
            param.Add("@PPincode", entity.PPincode);
            param.Add("@IsPPincodeCorrect", entity.IsPPincodeCorrect);
            param.Add("@IsCAddressSameAsPAddress", entity.IsCAddressSameAsPAddress);
            param.Add("@CAddress", entity.CAddress);
            param.Add("@CStateID", entity.CStateID);
            param.Add("@CDistrictID", entity.CDistrictID);
            param.Add("@CTalukaID", entity.CTalukaID);
            param.Add("@CCityID", entity.CCityID);
            param.Add("@COtherCity", entity.COtherCity);
            param.Add("@CPincode", entity.CPincode);
            param.Add("@IsCPincodeCorrect", entity.IsCPincodeCorrect);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveAddress", param).ToString();
        }
    }
}
