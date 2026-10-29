
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Administration
{
    public class ManageProjectConfigurationWorker : IManageProjectConfiguration
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ManageProjectConfigurationWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public DataTable GetProjectConfigurationList(short RegionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetProjectConfigurationList(RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProjectConfigurationList");
                throw ex;
            }
            return dt;
        }
        public DataSet GetProjectConfigurationDetails(short RegionID, string AppKey)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetProjectConfigurationDetails(RegionID, AppKey);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProjectConfigurationDetails");
                throw ex;
            }
            return ds;
        }
        public string SaveProjectConfigurationDetails(short RegionID, string AppKey, string AppValue, string ModifiedBy, string ModifiedByIPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveProjectConfigurationDetails(RegionID, AppKey, AppValue, ModifiedBy, ModifiedByIPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveProjectConfigurationDetails");
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
