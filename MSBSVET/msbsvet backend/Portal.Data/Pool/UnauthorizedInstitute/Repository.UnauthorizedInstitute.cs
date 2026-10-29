using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using System.Data;
using System.IO;
using System.Xml.Serialization;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet GetUnauthorizedInstituteDetails(string ComplaintNo)
        {
            var param = new Dictionary<string, object>();

            param.Add("@ComplaintNo", ComplaintNo); 

            return _dbAccess.GetDataSet("Institute_GetUnauthorizedRegisterComplaint", param);
        }
    }
}
