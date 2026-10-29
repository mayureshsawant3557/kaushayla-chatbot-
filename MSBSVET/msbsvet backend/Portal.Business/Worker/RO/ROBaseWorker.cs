using Portal.Business.Interface.RO;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.RO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Business.Worker.RO
{
    public class ROBaseWorker : IROBase
    {
        private readonly Repository _objData;
        public ROBaseWorker(Repository objData)
        {
            _objData = objData;
        }

        public List<ROManagementDetailsEntity> GetROManagementDetails(long roID)
        {
            try
            {
                var retVal = _objData.GetROManagementDetails(roID);

                return retVal ?? new List<ROManagementDetailsEntity>();
            }
            catch (Exception ex)
            {
                throw new Exception("Error while fetching RO details: " + ex.Message);
            }
        }

        public string SaveROManagementDetails(ROManagementDetailsEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveROManagementDetails(entity);
                if (retVal.ToUpper() == "N" || string.IsNullOrEmpty(retVal))
                {
                    retVal = "Data has not been saved. Please try again.";
                }
                else
                {
                    retVal = "Data saved successfully.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveROManagementDetails", entity?.CreateBy);
                retVal = ex.Message;
            }
            return retVal;
        }

        public DataTable RO_GetRo_ManagementTypeByRoID(long ROID, int managementType)
        {
            DataTable dt = null;
            try
            {
                dt = _objData.RO_GetRo_ManagementTypeByRoID(ROID, managementType);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstitutePromoterTypeByInstituteID", ROID.ToString());
            }
            return dt;
        }

    }
}
