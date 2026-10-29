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
        public DataTable GetEstablishmentEmployee(EstablishmentInput entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.GetDataTable("Establishment_GetEmployee", param);
        }
        public string SaveEstablishmentEmployee(EstablishmentEmployeeEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@EstablishmentID", entity.EstablishmentID);
            param.Add("@PermanentEmployees", entity.PermanentEmployees);
            param.Add("@TemporaryEmployees", entity.TemporaryEmployees);
            param.Add("@TotalEmployees", entity.TotalEmployees);
            param.Add("@EmployeesHiredFromOtherAgencies", entity.EmployeesHiredFromOtherAgencies);
            param.Add("@MinimumEligibleApprentices", entity.MinimumEligibleApprentices);
            param.Add("@MaximumEligibleApprentices", entity.MaximumEligibleApprentices);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);
            param.Add("@PageCode", entity.PageCode);

            return _dbAccess.ExecuteScalar("Establishment_SaveEmployee", param).ToString();
        }
    }
}
