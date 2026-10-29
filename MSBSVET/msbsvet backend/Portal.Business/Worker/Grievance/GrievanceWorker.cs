using System;
using System.Collections.Generic;
using Portal.Data;
using Portal.Entities;
using System.Data;
using Portal.Business;
using System.Threading.Tasks;
using Portal.Business.Worker.Utility;


namespace Portal.Business
{
    public class GrievanceWorker : IGrievance
    {
        private readonly Repository objData;

        //Inject Repository via Constructor 
        public GrievanceWorker(Repository repository)
        {
            objData = repository ?? throw new ArgumentNullException(nameof(repository));
        }

        public Int64 SendGrievance(GrievanceEntity entity)
        {
            Int64 retVal = 0;
            try
            {
                retVal = objData.SendGrievance(entity);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SendGrievance", entity.MobileNo);
                throw ex;
            }
            return retVal;
        }
        public GrievanceEntity CheckGrievanceStatus(Int64 GrievanceID, string MobileNo)
        {
            GrievanceEntity obj = new GrievanceEntity();
            try
            {
                DataTable dt = objData.CheckGrievanceStatus(GrievanceID, MobileNo);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.GrievanceID = Convert.ToInt64(dr["GrievanceID"]);
                    obj.FirstName = Convert.ToString(dr["FirstName"]);
                    obj.MiddleName = Convert.ToString(dr["MiddleName"]);
                    obj.LastName = Convert.ToString(dr["LastName"]);
                    obj.ProfileID = Convert.ToString(dr["ProfileID"]);
                    obj.EMailID = Convert.ToString(dr["EMailID"]);
                    obj.MobileNo = Convert.ToString(dr["MobileNo"]);
                    obj.GrievanceCategory = Convert.ToString(dr["GrievanceCategory"]);
                    obj.Grievance = Convert.ToString(dr["Grievance"]);
                    obj.GrievanceFileURL = Convert.ToString(dr["GrievanceFileURL"]);
                    obj.GrievanceDate = Convert.ToString(dr["GrievanceDate"]);
                    obj.GrievanceTime = Convert.ToString(dr["GrievanceTime"]);
                    obj.RepliedGrievance = Convert.ToString(dr["RepliedGrievance"]);
                    obj.RepliedGrievanceFileURL = Convert.ToString(dr["RepliedGrievanceFileURL"]);
                    obj.RepliedGrievanceDate = Convert.ToString(dr["RepliedGrievanceDate"]);
                    obj.RepliedGrievanceTime = Convert.ToString(dr["RepliedGrievanceTime"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckGrievanceStatus", GrievanceID.ToString());
                throw ex;
            }
            return obj;
        }
        public DataSet GetGrievanceDashboard(Int32 UserTypeID, string UserLoginID)
        {
            DataSet ds = new DataSet();
            try
            {
                ds = objData.GetGrievanceDashboard(UserTypeID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetGrievanceDashboard", UserLoginID);
                throw ex;
            }
            return ds;
        }
        public DataTable GetPendingGrievanceList()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetPendingGrievanceList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPendingGrievanceList");
                throw ex;
            }
            return dt;
        }
        public DataTable GetRepliedGrievanceList()
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetRepliedGrievanceList();
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetRepliedGrievanceList");
                throw ex;
            }
            return dt;
        }
        public string ReplyGrievance(GrievanceEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.ReplyGrievance(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ReplyGrievance", entity.GrievanceID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
