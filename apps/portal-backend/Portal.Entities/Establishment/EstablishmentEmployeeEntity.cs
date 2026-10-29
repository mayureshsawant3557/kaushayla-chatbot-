using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Establishment
{
    public class EstablishmentEmployeeEntity
    {
        public Int64 EstablishmentID { get; set; }
        public Int32 PermanentEmployees { get; set; }
        public Int32 TemporaryEmployees { get; set; }
        public Int32 TotalEmployees { get; set; }
        public Int32 EmployeesHiredFromOtherAgencies { get; set; }
        public Int32 MinimumEligibleApprentices { get; set; }
        public Int32 MaximumEligibleApprentices { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
        public string PageCode { get; set; }
        public string ReasonForRejection { get; set; }
    }
}
