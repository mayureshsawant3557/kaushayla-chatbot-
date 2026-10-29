using Portal.Entities;
using Portal.Entities.Registration;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml.Serialization;

namespace Portal.Data
{
	public partial class Repository
	{
		public DataSet GetStaffPrimary(StaffInput entity)
		{
			var param = new Dictionary<string, object>();

			param.Add("@StaffID", entity.StaffID);
			param.Add("@UserLoginID", entity.UserLoginID);
			param.Add("@PageCode", entity.PageCode);

			return _dbAccess.GetDataSet("Staff_GetPrimary", param);
		}
		public string SaveStaffPrimary(StaffPrimaryEntity entity)
		{
			var param = new Dictionary<string, object>();
			string jobRole = "";

			var serializer = new XmlSerializer(typeof(List<JobRole>), new XmlRootAttribute("root"));
			using (var stream = new StringWriter())
			{
				serializer.Serialize(stream, entity.ListJobRole);
				jobRole = stream.ToString();
			}
			param.Add("@StaffID", entity.StaffID);
			param.Add("@FirstName", entity.FirstName);
			param.Add("@MiddleName", entity.MiddleName);
			param.Add("@LastName", entity.LastName);
			param.Add("@PhotoFilePath", entity.PhotoFilePath);
			param.Add("@SignFilePath", entity.SignFilePath);
			param.Add("@GenderCode", entity.GenderCode);
			param.Add("@DOB", entity.DOB);
			param.Add("@DOBFilePath", entity.DOBFilePath);
			param.Add("@AadhaarNo", entity.AadhaarNo);
			param.Add("@AadhaarFilePath", entity.AadhaarFilePath);
			param.Add("@MobileNo", entity.MobileNo);
			param.Add("@AltMobileNo", entity.AltMobileNo);
			param.Add("@EMailID", entity.EMailID);
			param.Add("@JobRole", jobRole);
			param.Add("@UserLoginID", entity.UserLoginID);
			param.Add("@IPAddress", entity.IPAddress);
			param.Add("@PageCode", entity.PageCode);
			//param.Add("@IsAadhaarNoVerify", entity.IsAadhaarNoVerify);
			param.Add("@IsAddhareVerify", entity.IsAddhareVerify);

			return _dbAccess.ExecuteScalar("Staff_SavePrimary", param).ToString();
		}
        public DataTable GetStaffDashboard(long StaffID)
        {
            var param = new Dictionary<string, object>
            {
                { "@StaffID", StaffID }
            };

            return _dbAccess.GetDataTable("Dashboard_GetStaffDashboard", param);
        }
    }
}
