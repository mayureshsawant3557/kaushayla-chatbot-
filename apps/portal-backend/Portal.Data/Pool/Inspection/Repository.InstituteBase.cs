using Portal.Entities;
using Portal.Entities.Institute;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
//using System.Web.UI.WebControls;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataSet GetInspectionStatuswiseInstituteReport(InstituteInputEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserLoginId", entity.UserLoginID);
            param.Add("@PageCode", entity.PageCode);
            param.Add("@InspectionStatus", entity.ItemId);

            return _dbAccess.GetDataSet("Inspection_GetInspectionStatuswiseInstituteReport", param);
        }
    }
}
