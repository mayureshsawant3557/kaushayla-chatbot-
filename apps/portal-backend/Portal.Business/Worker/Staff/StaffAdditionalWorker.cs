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
    public class StaffAdditionalWorker : IStaffAdditional
    {
        private readonly Repository objData;


        //private readonly CommonHelper _commonHelper;
        //Inject Repository via Constructor 
        public StaffAdditionalWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
            //_commonHelper = commonHelper ?? throw new ArgumentNullException(nameof(commonHelper));
        }

        public StaffAdditionalEntity GetStaffAdditional(StaffInput entity)
        {
            StaffAdditionalEntity obj = new StaffAdditionalEntity();
            try
            {
                DataTable dt = objData.GetStaffAdditional(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.BloodGroupID = Convert.ToInt16(dr["BloodGroupID"]);
                    obj.MotherTongueID = Convert.ToInt16(dr["MotherTongueID"]);
                }
            }
            catch (Exception ex)
            {
                Utility.CommonHelper.SaveException(ex.Message, "GetStaffAdditional", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string SaveStaffAdditional(StaffAdditionalEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffAdditional(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffAdditional", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }

        public List<StaffLanguageEntity> GetStaffLanguageList(long StaffID)
        {
            List<StaffLanguageEntity> list = new List<StaffLanguageEntity>();
            try
            {
                DataTable dt = objData.GetStaffLanguageList(StaffID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    StaffLanguageEntity obj;
                    foreach (DataRow dr in dt.Rows)
                    {
                        obj = new StaffLanguageEntity();

                        obj.LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]);
                        obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                        obj.LanguageID = Convert.ToInt16(dr["LanguageID"]);
                        obj.Language = Convert.ToString(dr["Language"]);
                        obj.Read = Convert.ToInt16(dr["Read"]);
                        obj.ReadStr = Convert.ToString(dr["ReadStr"]);
                        obj.Write = Convert.ToInt16(dr["Write"]);
                        obj.WriteStr = Convert.ToString(dr["WriteStr"]);
                        obj.Speak = Convert.ToInt16(dr["Speak"]);
                        obj.SpeakStr = Convert.ToString(dr["SpeakStr"]);

                        list.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffLanguageList", StaffID.ToString());
                throw ex;
            }
            return list;
        }
        public StaffLanguageEntity GetStaffLanguage(long LanguageRowID)
        {
            StaffLanguageEntity obj = new StaffLanguageEntity();
            try
            {
                DataTable dt = objData.GetStaffLanguage(LanguageRowID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.LanguageRowID = Convert.ToInt64(dr["LanguageRowID"]);
                    obj.StaffID = Convert.ToInt64(dr["StaffID"]);
                    obj.LanguageID = Convert.ToInt16(dr["LanguageID"]);
                    obj.Read = Convert.ToInt16(dr["Read"]);
                    obj.Write = Convert.ToInt16(dr["Write"]);
                    obj.Speak = Convert.ToInt16(dr["Speak"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetStaffLanguage", LanguageRowID.ToString());
                throw ex;
            }
            return obj;
        }
        public string DeleteStaffLanguage(StaffLanguageEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.DeleteStaffLanguage(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteStaffLanguage", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string SaveStaffLanguage(StaffLanguageEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.SaveStaffLanguage(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveStaffLanguage", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
