using Portal.Entities;
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
		public DataTable GetStaffWorkExperienceList(Int64 StaffID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@StaffID", StaffID);

			return _dbAccess.GetDataTable("Staff_GetWorkExperienceList", param);
		}
		public DataTable GetStaffWorkExperience(Int64 WorkExperienceRowID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@WorkExperienceRowID", WorkExperienceRowID);

			return _dbAccess.GetDataTable("Staff_GetWorkExperience", param);
		}
		public string DeleteStaffWorkExperience(StaffWorkExperienceEntity entity)
		{
			var param = new Dictionary<string, object>();

			param.Add("@WorkExperienceRowID", entity.WorkExperienceRowID);
			param.Add("@StaffID", entity.StaffID);
			param.Add("@UserLoginID", entity.UserLoginID);
			param.Add("@IPAddress", entity.IPAddress);
			param.Add("@PageCode", entity.PageCode);

			return _dbAccess.ExecuteScalar("Staff_DeleteWorkExperience", param).ToString();
		}
		public string SaveStaffWorkExperience(StaffWorkExperienceEntity entity)
		{
			var param = new Dictionary<string, object>();

			param.Add("@WorkExperienceRowID", entity.WorkExperienceRowID);
			param.Add("@StaffID", entity.StaffID);
			param.Add("@EstablishmentName", entity.EstablishmentName);
			param.Add("@FromDate", entity.FromDate);
			param.Add("@ToDate", entity.ToDate);
			param.Add("@SalaryPerMonth", entity.SalaryPerMonth);
			param.Add("@JobRole", entity.JobRole);
			param.Add("@Address", entity.Address);
			param.Add("@StateID", entity.StateID);
			param.Add("@DistrictID", entity.DistrictID);
			param.Add("@TalukaID", entity.TalukaID);
			param.Add("@CityID", entity.CityID);
			param.Add("@OtherCity", entity.OtherCity);
			param.Add("@Pincode", entity.Pincode);
			param.Add("@IsPincodeCorrect", entity.IsPincodeCorrect);
			param.Add("@UserLoginID", entity.UserLoginID);
			param.Add("@IPAddress", entity.IPAddress);
			param.Add("@PageCode", entity.PageCode);
            param.Add("@IsWorkExperience", entity.IsWorkExperience);

            return _dbAccess.ExecuteScalar("Staff_SaveWorkExperience", param).ToString();
		}
		public string SaveSectorialExpertise(List<SectorialExpertiseEntity> entity,Int64 StaffID, string UserLoginID, string IPAddress)
		{
			var param = new Dictionary<string, object>();
			string sectorialExpertise = "";

			var serializer = new XmlSerializer(typeof(List<SectorialExpertiseEntity>), new XmlRootAttribute("root"));
			using (var stream = new StringWriter())
			{
				serializer.Serialize(stream, entity);
				sectorialExpertise = stream.ToString();
			}
			param.Add("@StaffID", StaffID);
			param.Add("@SectorialExpertise", sectorialExpertise);
			param.Add("@UserLoginID", UserLoginID);
			param.Add("@IPAddress", IPAddress);
            


            return _dbAccess.ExecuteScalar("Staff_SaveSectorialExpertise", param).ToString();
		}


		public DataTable GetStaffSectorialExpertiseList(Int64 StaffID)
		{
			var param = new Dictionary<string, object>();

			param.Add("@StaffID", StaffID);

			return _dbAccess.GetDataTable("Staff_GetSectorialExpertiseList", param);
		}
	}
}
