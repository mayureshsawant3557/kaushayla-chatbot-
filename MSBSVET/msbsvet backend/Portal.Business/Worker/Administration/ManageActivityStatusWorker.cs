using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Utility;
using Portal.Data;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Administration
{
    public class ManageActivityStatusWorker : IManageActivityStatus
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public ManageActivityStatusWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public DataTable GetActivityStatusList(short RegionID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetActivityStatusList(RegionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetActivityStatusList");
                throw ex;
            }
            return dt;
        }
        public DataSet GetActivityStatusDetails(short RegionID, string ActivityName)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetActivityStatusDetails(RegionID, ActivityName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetActivityStatusDetails");
                throw ex;
            }
            return ds;
        }
        public string SaveActivityStatusDetails(short RegionID, string ActivityName, DateTime? ActivityStartDateTime, DateTime? ActivityEndDateTime, string ModifiedBy, string ModifiedByIPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveActivityStatusDetails(RegionID, ActivityName, ActivityStartDateTime, ActivityEndDateTime, ModifiedBy, ModifiedByIPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveActivityStatusDetails");
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
