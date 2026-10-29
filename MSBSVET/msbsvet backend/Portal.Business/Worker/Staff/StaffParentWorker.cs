using Portal.Business.Interface.Staff;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Staff;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Staff
{
    public class StaffParentWorker : IStaffParent
    {

        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffParentWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public StaffParentEntity GetStaffParent(StaffInput entity)
        {
            StaffParentEntity obj = new StaffParentEntity();
            try
            {
                DataTable dt = objData.GetStaffParent(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.IsOrphan = Convert.ToInt16(dr["IsOrphan"]);
                    obj.FatherFirstName = Convert.ToString(dr["FatherFirstName"]);
                    obj.FatherMiddleName = Convert.ToString(dr["FatherMiddleName"]);
                    obj.FatherLastName = Convert.ToString(dr["FatherLastName"]);
                    obj.MotherFirstName = Convert.ToString(dr["MotherFirstName"]);
                    obj.MotherMiddleName = Convert.ToString(dr["MotherMiddleName"]);
                    obj.MotherLastName = Convert.ToString(dr["MotherLastName"]);
                    obj.MaritalStatus = Convert.ToString(dr["MaritalStatus"]);
                    obj.SpouseTitle = Convert.ToString(dr["SpouseTitle"]);
                    obj.SpouseFirstName = Convert.ToString(dr["SpouseFirstName"]);
                    obj.SpouseMiddleName = Convert.ToString(dr["SpouseMiddleName"]);
                    obj.SpouseLastName = Convert.ToString(dr["SpouseLastName"]);
                    obj.FatherTitle = Convert.ToString(dr["FatherTitle"]);
                    obj.MotherTitle = Convert.ToString(dr["MotherTitle"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffParent", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffParent(StaffParentEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffParent(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffParent", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
