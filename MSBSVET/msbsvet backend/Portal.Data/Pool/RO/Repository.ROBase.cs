using Portal.Entities.RO;
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
        public List<ROManagementDetailsEntity> GetROManagementDetails(long roID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ROID", roID);

            DataTable dt = _dbAccess.GetDataTable("RO_GetROManagementDetails", param);

            List<ROManagementDetailsEntity> list = new List<ROManagementDetailsEntity>();

            if (dt != null && dt.Rows.Count > 0)
            {
                foreach (DataRow row in dt.Rows)
                {
                    list.Add(new ROManagementDetailsEntity
                    {
                        ID = Convert.ToInt64(row["ID"]),
                        ROID = Convert.ToInt64(row["ROID"]),
                        StaffID = Convert.ToInt64(row["StaffID"]),
                        ManagementType = Convert.ToInt32(row["ManagementType"]),
                        Title = row["Title"].ToString(),
                        FirstName = row["FirstName"].ToString(),
                        MiddleName = row["MiddleName"].ToString(),
                        LastName = row["LastName"].ToString(),
                        MobileNo = row["MobileNo"].ToString(),
                        Gender = row["Gender"].ToString(),
                        DOB = row["DOB"].ToString(),
                        ProfileID = row["ProfileID"].ToString(),
                        CollegeRegistrationNo = row["CollegeRegistrationNo"].ToString(),
                        CollegeName = row["CollegeName"].ToString(),
                        Status = row["Status"].ToString(),
                        FormStatus = row.Table.Columns.Contains("FormStatus") && row["FormStatus"] != DBNull.Value
                            ? row["FormStatus"].ToString()
                            : null
                    });
                }
            }

            return list;

        }
        public string SaveROManagementDetails(ROManagementDetailsEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ROID", entity.ROID);
            param.Add("@StaffID", entity.StaffID);
            param.Add("@ManagementType", entity.ManagementType);
            param.Add("@User", entity.CreateBy);
            param.Add("@UserIpAddress", entity.IPAddress);

            var result = _dbAccess.ExecuteScalar("RO_InsertROManagementDetails", param);


            if (result != null && result.ToString() != "0")
            {
                return "Y";
            }
            else
            {
                return "N";
            }
        }

        public DataTable RO_GetRo_ManagementTypeByRoID(long ROID, int managementType)
        {
            var param = new Dictionary<string, object>();
            param.Add("@ROID", ROID);
            param.Add("@ManagementType", managementType);

            return _dbAccess.GetDataTable("RO_GetRo_ManagementTypeByRoID", param);
        }
    }
}
