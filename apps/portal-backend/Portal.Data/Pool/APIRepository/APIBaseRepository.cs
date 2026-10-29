using Portal.Data.Source;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Portal.Data
{
    public class APIBaseRepository : IAPIBaseRepository
    {
        private readonly DatabaseAccess _dbAccess;
        private string conString = "";
        public APIBaseRepository(IConfiguration _configuration)
        {
            conString = _configuration.GetConnectionString("DBConnection");
            _dbAccess = new DatabaseAccess(conString);
        }

        public DataTable GetMasterDistrict()
        {
            return _dbAccess.GetDataTable("Base_GetMasterDistrict");
        }


    }
}
