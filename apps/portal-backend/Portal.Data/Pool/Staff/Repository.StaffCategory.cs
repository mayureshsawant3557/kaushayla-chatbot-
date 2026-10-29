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
        public DataTable GetStaffCategory(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_GetCategory", param);
        }
        public string SaveStaffCategory(StaffCategoryEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@NationalityID", entity.NationalityID);
			param.Add("@LeavingCertificatePath", entity.LeavingCertificatePath);
			param.Add("@IsMHDomiciled", entity.IsMHDomiciled);
            param.Add("@DomicileCertificatePath", entity.DomicileCertificatePath);
            param.Add("@ReligionID", entity.ReligionID);
            param.Add("@CategoryID", entity.CategoryID);
            param.Add("@CasteID", entity.CasteID);
            param.Add("@CasteCertificatePath", entity.CasteCertificatePath);
            param.Add("@IsBelongToNCL", entity.IsBelongToNCL);
            param.Add("@NCLCertificatePath", entity.NCLCertificatePath);
            param.Add("@IsBelongToPWD", entity.IsBelongToPWD);
            param.Add("@DisabilityPercentage", entity.DisabilityPercentage);
            param.Add("@DisabilityID", entity.DisabilityID);
            param.Add("@DisabilityType", entity.DisabilityType);
            param.Add("@UniqueDisabilityIDNo", entity.UniqueDisabilityIDNo);
            param.Add("@PWDCertificatePath", entity.PWDCertificatePath);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveCategory", param).ToString();
        }
    }
}
