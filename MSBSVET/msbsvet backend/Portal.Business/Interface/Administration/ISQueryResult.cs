using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Interface.Administration
{
    public interface ISQueryResult
    {
        SQueryResultEntity ExecuteSQueryResult(SQueryResultEntity SQueryResultEntity);
        DataTable GetAllSQLTablesDropDown();
        DataTable GetSQueryExecutersMobileNumber();
        bool GetMobileAuthenticationFlag();
    }
}

