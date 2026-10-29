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
        public DataTable GetStaffAdditional(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_GetAdditional", param);
        }
        public string SaveStaffAdditional(StaffAdditionalEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@BloodGroupID", entity.BloodGroupID);
            param.Add("@MotherTongueID", entity.MotherTongueID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveAdditional", param).ToString();
        }

        public DataTable GetStaffLanguageList(Int64 StaffID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", StaffID);

            return _dbAccess.GetDataTable("Staff_GetLanguageList", param);
        }
        public DataTable GetStaffLanguage(Int64 LanguageRowID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LanguageRowID", LanguageRowID);

            return _dbAccess.GetDataTable("Staff_GetLanguage", param);
        }
        public string DeleteStaffLanguage(StaffLanguageEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LanguageRowID", entity.LanguageRowID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_DeleteLanguage", param).ToString();
        }
        public string SaveStaffLanguage(StaffLanguageEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LanguageRowID", entity.LanguageRowID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@LanguageID", entity.LanguageID);
            param.Add("@Read", entity.Read);
            param.Add("@Write", entity.Write);
            param.Add("@Speak", entity.Speak);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveLanguage", param).ToString();
        }
    }
}
