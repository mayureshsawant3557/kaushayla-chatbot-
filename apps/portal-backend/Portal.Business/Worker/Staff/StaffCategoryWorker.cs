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
    public class StaffCategoryWorker : IStaffCategory
    {
        private readonly Repository objData;
        //Inject Repository via Constructor 
        public StaffCategoryWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public StaffCategoryEntity GetStaffCategory(StaffInput entity)
        {
            StaffCategoryEntity obj = new StaffCategoryEntity();
            try
            {
                DataTable dt = objData.GetStaffCategory(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.NationalityID = Convert.ToInt16(dr["NationalityID"]);
                    obj.IsMHDomiciled = Convert.ToInt16(dr["IsMHDomiciled"]);
                    obj.DomicileCertificatePath = Convert.ToString(dr["DomicileCertificatePath"]);
                    obj.LeavingCertificatePath = Convert.ToString(dr["LeavingCertificatePath"]);
                    obj.ReligionID = Convert.ToInt16(dr["ReligionID"]);
                    obj.CategoryID = Convert.ToInt16(dr["CategoryID"]);
                    obj.CasteID = Convert.ToInt32(dr["CasteID"]);
                    obj.CasteCertificatePath = Convert.ToString(dr["CasteCertificatePath"]);
                    obj.IsBelongToNCL = Convert.ToInt16(dr["IsBelongToNCL"]);
                    obj.NCLCertificatePath = Convert.ToString(dr["NCLCertificatePath"]);
                    obj.IsBelongToPWD = Convert.ToInt16(dr["IsBelongToPWD"]);
                    obj.DisabilityPercentage = Convert.ToInt16(dr["DisabilityPercentage"]);
                    obj.DisabilityID = Convert.ToInt16(dr["DisabilityID"]);
                    obj.DisabilityType = Convert.ToString(dr["DisabilityType"]);
                    obj.UniqueDisabilityIDNo = Convert.ToString(dr["UniqueDisabilityIDNo"]);
                    obj.PWDCertificatePath = Convert.ToString(dr["PWDCertificatePath"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffCategory", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffCategory(StaffCategoryEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffCategory(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffCategory", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
