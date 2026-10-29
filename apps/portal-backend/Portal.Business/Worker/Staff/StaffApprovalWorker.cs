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
    public class StaffApprovalWorker : IStaffApproval
    {

        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffApprovalWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public DataTable SearchStaffManagement(int DistrictID, int TalukaID, int RegionID, string FormStatus, string ProfileID)
        {
            DataTable ds = new DataTable();
            try
            {
                ds = objData.SearchStaffManagement(DistrictID, TalukaID, RegionID, FormStatus, ProfileID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchStaffManagement");
                throw ex;
            }
            return ds;
        }
        public string SaveStaffPrimaryVerification(StaffPrimaryEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffPrimaryVerification(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffPrimaryVerification", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
