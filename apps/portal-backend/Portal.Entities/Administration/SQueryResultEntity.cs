using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Administration
{
    public class SQueryResultEntity
    {
        public string SQLQuery { get; set; }
        public string[] SQLTables { get; set; }
        public string UserName { get; set; }
        public string IPAddress { get; set; }
        public string MobileNumber { get; set; }
        public string OTP { get; set; }
        public string IsSuccessError { get; set; }
        public DataSet ResultTables { get; set; }
        public bool IsMobileNoVerif { get; set; }
        public bool hideMobileDropd { get; set; }
    }
}
