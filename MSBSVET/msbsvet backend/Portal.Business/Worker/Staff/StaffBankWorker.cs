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
    public class StaffBankWorker : IStaffBank
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffBankWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public StaffBankEntity GetStaffBank(StaffInput entity)
        {
            StaffBankEntity obj = new StaffBankEntity();
            try
            {
                DataTable dt = objData.GetStaffBank(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.AccountType = Convert.ToString(dr["AccountType"]);
                    obj.AccountNo = Convert.ToString(dr["AccountNo"]);
                    obj.AccountHolderName = Convert.ToString(dr["AccountHolderName"]);
                    obj.IFSCCode = Convert.ToString(dr["IFSCCode"]);
                    obj.BankName = Convert.ToString(dr["BankName"]);
                    obj.BranchName = Convert.ToString(dr["BranchName"]);
                    obj.CancelChequePath = Convert.ToString(dr["CancelChequePath"]);
                    obj.PANNo = Convert.ToString(dr["PANNo"]);
                    obj.PANPath = Convert.ToString(dr["PANPath"]);
                    obj.IsBankAcount = Convert.ToString(dr["IsBankAcount"]);
                    obj.IsPANDetails = Convert.ToString(dr["IsPANDetails"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffBank", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffBank(StaffBankEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffBank(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffBank", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
