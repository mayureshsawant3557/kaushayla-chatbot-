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
        public DataTable GetStaffParent(StaffInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Staff_GetParent", param);
        }
        public string SaveStaffParent(StaffParentEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@StaffID", entity.StaffID);
            param.Add("@IsOrphan", entity.IsOrphan);
            param.Add("@FatherFirstName", entity.FatherFirstName);
            param.Add("@FatherMiddleName", entity.FatherMiddleName);
            param.Add("@FatherLastName", entity.FatherLastName);
            param.Add("@MotherFirstName", entity.MotherFirstName);
            param.Add("@MotherMiddleName", entity.MotherMiddleName);
            param.Add("@MotherLastName", entity.MotherLastName);
            param.Add("@MaritalStatus", entity.MaritalStatus);
            param.Add("@SpouseTitle", entity.SpouseTitle);
            param.Add("@SpouseFirstName", entity.SpouseFirstName);
            param.Add("@SpouseMiddleName", entity.SpouseMiddleName);
            param.Add("@SpouseLastName", entity.SpouseLastName);
            param.Add("@FatherTitle", entity.FatherTitle);
            param.Add("@MotherTitle", entity.MotherTitle);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Staff_SaveParent", param).ToString();
        }
    }
}
