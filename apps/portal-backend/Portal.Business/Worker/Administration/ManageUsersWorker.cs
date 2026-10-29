    using Portal.Business.Interface.Administration;
    using Portal.Business.Worker.Utility;
    using Portal.Data;
    using Portal.Entities.Administration;
    using System;
    using System.Data;

    namespace Portal.Business.Worker.Administration
    {
        public class ManageUsersWorker : IManageUsers
        {
            private readonly Repository objData;

            public ManageUsersWorker(Repository repository)
            {
                objData = repository ?? throw new ArgumentNullException(nameof(repository));
            }

            public DataTable GetUsersList(int UserTypeID)
            {
                DataTable dt = new DataTable();
                try
                {
                    dt = objData.GetUsersList(UserTypeID);
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "GetUsersList");
                    throw ex;
                }
                return dt;
            }

            public string ActivateOrDeactivateUser(long UserID, string ModifiedBy, string ModifiedByIPAddress)
            {
                string retVal = "";
                try
                {
                    retVal = objData.ActivateOrDeactivateUser(UserID, ModifiedBy, ModifiedByIPAddress);
                    if (retVal.ToUpper() == "N")
                        retVal = "Data has not been saved. Please try again.";
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "ActivateOrDeactivateUser");
                    retVal = ex.Message;
                }
                return retVal;
            }

            public string SaveUser(UserEntity entity)
            {
                string retVal = "";
                try
                {
                    retVal = objData.SaveUser(entity);
                    if (retVal.ToUpper() == "N")
                        retVal = "Data has not been saved. Please try again.";
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "SaveUser");
                    retVal = ex.Message;
                }
                return retVal;
            }

            public UserEntity GetUserDetails(long UserID)
            {
                UserEntity obj = new UserEntity();
                try
                {
                    DataTable dt = objData.GetUserDetails(UserID);
                    if (dt != null && dt.Rows.Count > 0)
                    {
                        DataRow dr = dt.Rows[0];
                        obj.UserID = Convert.ToInt64(dr["UserID"]);
                        obj.UserTypeID = Convert.ToInt32(dr["UserTypeID"]);
                        obj.UserType = Convert.ToString(dr["UserType"]);
                        obj.UserLoginID = Convert.ToString(dr["UserLoginID"]);
                        obj.UserPassword = Convert.ToString(dr["UserPassword"]);
                        obj.UserName = Convert.ToString(dr["UserName"]);
                        obj.UserMobileNo = Convert.ToString(dr["UserMobileNo"]);
                        obj.UserEMailID = Convert.ToString(dr["UserEMailID"]);
                        obj.IsActive = Convert.ToString(dr["IsActive"]);
                        obj.ActivOrDeactive = Convert.ToString(dr["ActivOrDeactive"]);
                    }
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "GetUserDetails");
                    throw ex;
                }
                return obj;
            }

            public string EditUser(UserEntity entity)
            {
                string retVal = "";
                try
                {
                    retVal = objData.EditUser(entity);
                    if (retVal.ToUpper() == "N")
                        retVal = "Data has not been saved. Please try again.";
                }
                catch (Exception ex)
                {
                    CommonHelper.SaveException(ex.Message, "EditUser");
                    retVal = ex.Message;
                }
                return retVal;
            }

        public DataTable SearchUserById(string searchTerm)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.SearchUserById(searchTerm);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SearchUserById");
                throw ex;
            }
            return dt;
        }
    }
    }