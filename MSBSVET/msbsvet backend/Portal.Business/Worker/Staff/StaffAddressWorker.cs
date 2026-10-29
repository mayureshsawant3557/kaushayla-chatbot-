using Portal.Business;
using Portal.Data;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Business.Interface.Staff;
using Portal.Entities.Staff;
using Portal.Business.Worker.Utility;

namespace Portal.Business.Worker.Staff
{
    public class StaffAddressWorker : IStaffAddress
    {
        private readonly Repository objData;


        //Inject Repository via Constructor 
        public StaffAddressWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
           
        }

        public StaffAddressEntity GetStaffAddress(StaffInput entity)
        {
            StaffAddressEntity obj = new StaffAddressEntity();
            try
            {
                DataTable dt = objData.GetStaffAddress(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.PAddress = Convert.ToString(dr["PAddress"]);
                    obj.PStateID = Convert.ToInt16(dr["PStateID"]);
                    obj.PDistrictID = Convert.ToInt32(dr["PDistrictID"]);
                    obj.PTalukaID = Convert.ToInt32(dr["PTalukaID"]);
                    obj.PCityID = Convert.ToInt32(dr["PCityID"]);
                    obj.POtherCity = Convert.ToString(dr["POtherCity"]);
                    obj.PPincode = Convert.ToString(dr["PPincode"]);
                    obj.IsPPincodeCorrect = Convert.ToInt16(dr["IsPPincodeCorrect"]);
                    obj.IsCAddressSameAsPAddress = Convert.ToInt16(dr["IsCAddressSameAsPAddress"]);
                    obj.CAddress = Convert.ToString(dr["CAddress"]);
                    obj.CStateID = Convert.ToInt16(dr["CStateID"]);
                    obj.CDistrictID = Convert.ToInt32(dr["CDistrictID"]);
                    obj.CTalukaID = Convert.ToInt32(dr["CTalukaID"]);
                    obj.CCityID = Convert.ToInt32(dr["CCityID"]);
                    obj.COtherCity = Convert.ToString(dr["COtherCity"]);
                    obj.CPincode = Convert.ToString(dr["CPincode"]);
                    obj.IsCPincodeCorrect = Convert.ToInt16(dr["IsCPincodeCorrect"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffAddress", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffAddress(StaffAddressEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffAddress(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffAddress", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
