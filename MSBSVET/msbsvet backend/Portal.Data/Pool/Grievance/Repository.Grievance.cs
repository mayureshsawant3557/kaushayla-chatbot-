using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Portal.Data;
using Portal.Entities;
using System.Data;
using System.Xml;
using System.Xml.Serialization;
using System.IO;
using System.Threading.Tasks;

namespace Portal.Data
{
    public partial class Repository
    {
        public Int64 SendGrievance(GrievanceEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@FirstName", entity.FirstName);
            param.Add("@MiddleName", entity.MiddleName);
            param.Add("@LastName", entity.LastName);
            param.Add("@ProfileID", entity.ProfileID);
            param.Add("@EMailID", entity.EMailID);
            param.Add("@MobileNo", entity.MobileNo);
            param.Add("@GrievanceCategoryID", entity.GrievanceCategoryID);
            param.Add("@OtherGrievanceCategory", entity.OtherGrievanceCategory);
            param.Add("@Grievance", entity.Grievance);
            param.Add("@GrievanceFileURL", entity.GrievanceFileURL);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return Convert.ToInt64(_dbAccess.ExecuteScalar("GRS_SendGrievance", param).ToString());
        }
        public DataTable CheckGrievanceStatus(Int64 GrievanceID, string MobileNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@GrievanceID", GrievanceID);
            param.Add("@MobileNo", MobileNo);

            return _dbAccess.GetDataTable("GRS_CheckGrievanceStatus", param);
        }
        public DataSet GetGrievanceDashboard(Int32 UserTypeID, string UserLoginID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataSet("GRS_GetGrievanceDashboard", param);
        }
        public DataTable GetPendingGrievanceList()
        {
            return _dbAccess.GetDataTable("GRS_GetPendingGrievanceList");
        }
        public DataTable GetRepliedGrievanceList()
        {
            return _dbAccess.GetDataTable("GRS_GetRepliedGrievanceList");
        }
        public string ReplyGrievance(GrievanceEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@GrievanceID", entity.GrievanceID);
            param.Add("@RepliedGrievance", entity.RepliedGrievance);
            param.Add("@RepliedGrievanceFileURL", entity.RepliedGrievanceFileURL);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("GRS_ReplyGrievance", param).ToString();
        }
    }
}
