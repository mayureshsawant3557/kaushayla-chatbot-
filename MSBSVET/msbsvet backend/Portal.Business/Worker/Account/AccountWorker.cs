using Portal.Business.Interface.Account;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Account;
using Portal.Entities.Administration;
using Portal.Entities.Authorization;
using System.Data;



namespace Portal.Business.Worker.Account
{
    public class AccountWorker : IAccount
    {
        // Repository objData = new Repository();
        private readonly Repository objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public AccountWorker(Repository objData)
        {
            this.objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }

        public LoggedInUser CheckUserExists(LoggedInUser user)
        {
            LoggedInUser loggedInUser = new LoggedInUser
            {
                UserLoginID = string.Empty,
                UserPassword = string.Empty,
                UserName = string.Empty,
                DashBoardPath = string.Empty,
                DashBoardPathReact = string.Empty,
                PhotoPath = string.Empty,
                ErrorMessage = string.Empty
            };
            try
            {
                DataTable dt = objData.CheckUserExists(user);

                if (dt != null && dt.Rows.Count > 0)
                {
                    loggedInUser.IsLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsLoginAllowed"].ToString());
                    loggedInUser.ErrorMessage = dt.Rows[0]["ErrorMessage"].ToString();

                    if (loggedInUser.IsLoginAllowed)
                    {
                        loggedInUser.UserID = Convert.ToInt64(dt.Rows[0]["UserID"]);
                        loggedInUser.UserTypeID = Convert.ToInt32(dt.Rows[0]["UserTypeID"]);
                        loggedInUser.UserLoginID = Convert.ToString(dt.Rows[0]["UserLoginID"]);
                        loggedInUser.UserName = Convert.ToString(dt.Rows[0]["UserName"]);
                        loggedInUser.UserTypeCode = Convert.ToString(dt.Rows[0]["UserTypeCode"]);
                        loggedInUser.DashBoardPath = Convert.ToString(dt.Rows[0]["DashBoardPath"]);
                        loggedInUser.DashBoardPathReact = Convert.ToString(dt.Rows[0]["DashBoardPathReact"]);
                        loggedInUser.PhotoPath = Convert.ToString(dt.Rows[0]["PhotoPath"]);
                        loggedInUser.LoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LoggedInSessionID"]);
                        loggedInUser.IsAdmin = Convert.ToBoolean(dt.Rows[0]["IsAdmin"]);
                        loggedInUser.IsMultipleLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsMultipleLoginAllowed"]);
                        loggedInUser.LastLoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LastLoggedInSessionID"]);
                        loggedInUser.SecurityQuestionID = Convert.ToInt16(dt.Rows[0]["SecurityQuestionID"]);
                        loggedInUser.IsPasswordResetDone = Convert.ToBoolean(dt.Rows[0]["IsPasswordResetDone"]);
                        loggedInUser.MsbsvetMtId = dt.Rows[0]["MsbsvetMtId"] != DBNull.Value
    ? Convert.ToInt32(dt.Rows[0]["MsbsvetMtId"])
    : 0;
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckUserExists", user.UserLoginID);
                throw ex;
            }
            return loggedInUser;
        }

        public LoggedInUser CheckUserExists(LoggedInUserRequest user)
        {
            LoggedInUser loggedInUser = new LoggedInUser
            {
                UserLoginID = string.Empty,
                UserPassword = string.Empty,
                UserName = string.Empty,
                DashBoardPath = string.Empty,
                DashBoardPathReact = string.Empty,
                PhotoPath = string.Empty,
                ErrorMessage = string.Empty
            };
            try
            {
                DataTable dt = objData.CheckUserExists(user);

                if (dt != null && dt.Rows.Count > 0)
                {
                    loggedInUser.IsLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsLoginAllowed"].ToString());
                    loggedInUser.ErrorMessage = dt.Rows[0]["ErrorMessage"].ToString();

                    if (loggedInUser.IsLoginAllowed)
                    {
                        loggedInUser.UserID = Convert.ToInt64(dt.Rows[0]["UserID"]);
                        loggedInUser.UserTypeID = Convert.ToInt32(dt.Rows[0]["UserTypeID"]);
                        loggedInUser.UserLoginID = Convert.ToString(dt.Rows[0]["UserLoginID"]);
                        loggedInUser.UserTypeCode = Convert.ToString(dt.Rows[0]["UserTypeCode"]);
                        loggedInUser.UserName = Convert.ToString(dt.Rows[0]["UserName"]);
                        loggedInUser.DashBoardPath = Convert.ToString(dt.Rows[0]["DashBoardPath"]);
                        loggedInUser.DashBoardPathReact = Convert.ToString(dt.Rows[0]["DashBoardPathReact"]);
                        loggedInUser.PhotoPath = Convert.ToString(dt.Rows[0]["PhotoPath"]);
                        loggedInUser.LoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LoggedInSessionID"]);
                        loggedInUser.IsAdmin = Convert.ToBoolean(dt.Rows[0]["IsAdmin"]);
                        loggedInUser.IsMultipleLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsMultipleLoginAllowed"]);
                        loggedInUser.LastLoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LastLoggedInSessionID"]);
                        loggedInUser.SecurityQuestionID = Convert.ToInt16(dt.Rows[0]["SecurityQuestionID"]);
                        loggedInUser.IsPasswordResetDone = Convert.ToBoolean(dt.Rows[0]["IsPasswordResetDone"]);
                        loggedInUser.MsbsvetMtId = dt.Rows[0]["MsbsvetMtId"] != DBNull.Value
     ? Convert.ToInt32(dt.Rows[0]["MsbsvetMtId"])
     : 0;


                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckUserExists", user.UserLoginID);
                throw ex;
            }
            return loggedInUser;
        }
        public void UpdateLoginStatus(long UserID, long LoggedInSessionID)
        {
            try
            {
                objData.UpdateLoginStatus(UserID, LoggedInSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateLoginStatus", UserID.ToString());
                throw ex;
            }
        }
        public void UpdateLogoutStatus(long UserID, long LoggedInSessionID)
        {
            try
            {
                objData.UpdateLogoutStatus(UserID, LoggedInSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateLogoutStatus", UserID.ToString());
                throw ex;
            }
        }
        public ForgotPasswordEntity CheckForgotPassword(ForgotPasswordEntity entity)
        {
            ForgotPasswordEntity obj = new ForgotPasswordEntity();
            try
            {
                DataTable dt = objData.CheckForgotPassword(entity);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.UserLoginID = dr["UserLoginID"].ToString();
                    obj.ErrorMessage = dr["ErrorMessage"].ToString();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckForgotPassword", entity.UserLoginID);
                throw ex;
            }
            return obj;
        }
        public ForgotPasswordEntity CheckForgotPassword(string UserLoginID, string MobileNo)
        {
            ForgotPasswordEntity obj = new ForgotPasswordEntity();
            try
            {
                DataTable dt = objData.CheckForgotPassword(UserLoginID, MobileNo);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.UserLoginID = dr["UserLoginID"].ToString();
                    obj.ErrorMessage = dr["ErrorMessage"].ToString();
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "CheckForgotPassword", UserLoginID);
                throw ex;
            }
            return obj;
        }
        public string ResetPassword(ForgotPasswordEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = objData.ResetPassword(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Password has not reset. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ResetPassword", entity.UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public string UpdateMobileNumber(string UserLoginID, string MobileNo, string IPAddress, string ModifyBy)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateMobileNumber(UserLoginID, MobileNo, IPAddress, ModifyBy);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Password has not reset. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ResetPassword", UserLoginID);
                retVal = ex.Message;
            }
            return retVal;
        }
        public bool IsCurrentLoginValid(long UserID, long LoggedInSessionID)
        {
            bool retVal = false;
            try
            {
                retVal = objData.IsCurrentLoginValid(UserID, LoggedInSessionID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "IsCurrentLoginValid", UserID.ToString());
                retVal = false;
            }
            return retVal;
        }
        public DataTable GetSecurityQuestionDetails(long UserID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetSecurityQuestionDetails(UserID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSecurityQuestionDetails", UserID.ToString());
                throw ex;
            }
            return dt;
        }
        public string ResetSecurityQuestion(long UserID, short SecurityQuestionID, string SecurityQuestionAnswer, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.ResetSecurityQuestion(UserID, SecurityQuestionID, SecurityQuestionAnswer, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Password has not reset. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ResetSecurityQuestion", UserID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string GetPassword(long UserID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetPassword(UserID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetPassword", UserID.ToString());
                throw ex;
            }
            return retVal;
        }
        public string GetUserName(string UserLoginID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetUserName(UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserName", UserLoginID);
                throw ex;
            }
            return retVal;
        }
        public DataTable GetLoggedInUserDetails(int UserTypeID, string UserLoginID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetLoggedInUserDetails(UserTypeID, UserLoginID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLoggedInUserDetails", UserLoginID);
                throw ex;
            }
            return dt;
        }

        public LoggedInUser GetLoggedInUser(int UserTypeID, string UserLoginID)
        {
            LoggedInUser loggedInUser = new LoggedInUser
            {
                UserLoginID = string.Empty,
                UserPassword = string.Empty,
                UserName = string.Empty,
                DashBoardPath = string.Empty,
                DashBoardPathReact = string.Empty,
                PhotoPath = string.Empty,
                ErrorMessage = string.Empty
               
            };
            try
            {
                DataTable dt = objData.GetLoggedInUserDetails(UserTypeID, UserLoginID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    loggedInUser.IsLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsLoginAllowed"].ToString());
                    loggedInUser.ErrorMessage = dt.Rows[0]["ErrorMessage"].ToString();

                    if (loggedInUser.IsLoginAllowed)
                    {
                        loggedInUser.UserID = Convert.ToInt64(dt.Rows[0]["UserID"]);
                        loggedInUser.UserTypeID = Convert.ToInt32(dt.Rows[0]["UserTypeID"]);
                        loggedInUser.UserLoginID = Convert.ToString(dt.Rows[0]["UserLoginID"]);
                        loggedInUser.UserName = Convert.ToString(dt.Rows[0]["UserName"]);
                        loggedInUser.DashBoardPath = Convert.ToString(dt.Rows[0]["DashBoardPath"]);
                        loggedInUser.DashBoardPathReact = Convert.ToString(dt.Rows[0]["DashBoardPathReact"]);
                        loggedInUser.PhotoPath = Convert.ToString(dt.Rows[0]["PhotoPath"]);
                        loggedInUser.LoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LoggedInSessionID"]);
                        loggedInUser.IsAdmin = Convert.ToBoolean(dt.Rows[0]["IsAdmin"]);
                        loggedInUser.IsMultipleLoginAllowed = Convert.ToBoolean(dt.Rows[0]["IsMultipleLoginAllowed"]);
                        loggedInUser.LastLoggedInSessionID = Convert.ToInt64(dt.Rows[0]["LastLoggedInSessionID"]);
                        loggedInUser.SecurityQuestionID = Convert.ToInt16(dt.Rows[0]["SecurityQuestionID"]);
                        loggedInUser.IsPasswordResetDone = Convert.ToBoolean(dt.Rows[0]["IsPasswordResetDone"]);
                        //loggedInUser.MsbsvetMtId = dt.Rows[0]["MsbsvetMtId"] != DBNull.Value? Convert.ToInt32(dt.Rows[0]["MsbsvetMtId"]): 0;
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLoggedInUser", UserLoginID);
                throw ex;
            }
            return loggedInUser;
        }
        public List<UserEntity> GetUserListForPasswordGeneration(int UserTypeID)
        {
            List<UserEntity> listUser = new List<UserEntity>();
            try
            {
                DataTable dt = objData.GetUserListForPasswordGeneration(UserTypeID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    foreach (DataRow dr in dt.Rows)
                    {
                        UserEntity obj = new UserEntity();

                        obj.UserID = Convert.ToInt64(dr["UserID"]);
                        obj.UserPassword = dr["UserPassword"].ToString();

                        listUser.Add(obj);
                    }
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserListForPasswordGeneration", UserTypeID.ToString());
                throw ex;
            }
            return listUser;
        }
        public string UpdateUserPassword(long UserID, string UserPassword, string UserLoginID, string IPAddress)
        {
            string retVal = "";
            try
            {
                retVal = objData.UpdateUserPassword(UserID, UserPassword, UserLoginID, IPAddress);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Password has not reset. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateUserPassword", UserID.ToString());
                retVal = ex.Message;
            }
            return retVal;
        }
        public string GetUserNameWithCode(long UserID)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetUserNameWithCode(UserID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserNameWithCode", UserID.ToString());
                throw ex;
            }
            return retVal;
        }
        public DataTable GetUserLoginIDByUserName(string UserName)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = objData.GetUserLoginIDByUserName(UserName);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserLoginIDByUserName", UserName);
                throw ex;
            }
            return dt;
        }
        public string GetUserLoginID(string UserName, string MobileNo)
        {
            string retVal = "";
            try
            {
                retVal = objData.GetUserLoginID(UserName, MobileNo);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetUserLoginID", UserName);
                throw ex;
            }
            return retVal;
        }

        public void SaveRefreshToken(long userID, string token, DateTime expiresAt)
        {
            try
            {
                objData.SaveRefreshToken(userID, token, expiresAt);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveRefreshToken", userID.ToString());
                throw ex;
            }
        }
        public void RevokeRefreshToken(string refreshToken)
        {
            try
            {
                objData.RevokeRefreshToken(refreshToken);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveRefreshToken");
                throw ex;
            }
        }
        public void RevokeRefreshTokenByUserId(long userID)
        {
            try
            {
                objData.RevokeRefreshTokenByUserId(userID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "RevokeRefreshTokenByUserId");
                throw ex;
            }
        }
        public RefreshToken? GetRefreshToken(string refreshToken)
        {
            var dt = objData.GetRefreshToken(refreshToken);

            if (dt.Rows.Count == 0)
                return null;

            var row = dt.Rows[0];

            return new RefreshToken
            {
                RefreshTokenID = Convert.ToInt64(row["RefreshTokenID"]),
                UserId = Convert.ToInt64(row["UserID"]),
                Token = row["Token"].ToString()!,
                ExpiresAt = Convert.ToDateTime(row["ExpiresAt"]),
                UserLoginID = Convert.ToString(row["UserLoginID"]),
                UserTypeID = Convert.ToInt32(row["UserTypeID"]),
            };
        }
        public RefreshToken? GetRefreshTokenByUserId(long userId)
        {
            var dt = objData.GetRefreshTokenByUserId(userId);

            if (dt.Rows.Count == 0)
                return null;

            var row = dt.Rows[0];

            return new RefreshToken
            {
                RefreshTokenID = Convert.ToInt64(row["RefreshTokenID"]),
                UserId = Convert.ToInt64(row["UserID"]),
                Token = row["Token"].ToString()!,
                ExpiresAt = Convert.ToDateTime(row["ExpiresAt"]),
                UserLoginID = Convert.ToString(row["UserLoginID"]),
                UserTypeID = Convert.ToInt32(row["UserTypeID"]),
            };
        }
        public LoggedInUser GetUserById(long userId)
        {
            LoggedInUser loggedInUser = new LoggedInUser
            {
                UserLoginID = string.Empty,
                UserPassword = string.Empty,
                UserName = string.Empty,
                DashBoardPath = string.Empty,
                DashBoardPathReact = string.Empty,
                PhotoPath = string.Empty,
                ErrorMessage = string.Empty
            };
            try
            {
                DataTable dt = objData.GetUserById(userId);

                if (dt != null && dt.Rows.Count > 0)
                {
                    loggedInUser.UserID = Convert.ToInt64(dt.Rows[0]["UserID"]);
                    loggedInUser.UserTypeID = Convert.ToInt32(dt.Rows[0]["UserTypeID"]);
                    loggedInUser.UserLoginID = Convert.ToString(dt.Rows[0]["UserLoginID"]);
                    loggedInUser.UserName = Convert.ToString(dt.Rows[0]["UserName"]);
                    loggedInUser.IsAdmin = Convert.ToBoolean(dt.Rows[0]["IsAdmin"]);

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLoggedInUser", userId.ToString());
                throw ex;
            }
            return loggedInUser;
        }

        public LoggedInUser VerifyRefreshTokenAndGetUser(string refreshToken, bool IsRotate)
        {
            LoggedInUser loggedInUser = new LoggedInUser
            {
                UserLoginID = string.Empty,
                UserPassword = string.Empty,
                UserName = string.Empty,
                DashBoardPath = string.Empty,
                DashBoardPathReact = string.Empty,
                PhotoPath = string.Empty,
                ErrorMessage = string.Empty
            };
            try
            {
                DataTable dt = objData.ValidateRefreshToken_GetUser(refreshToken, IsRotate);

                if (dt != null && dt.Rows.Count > 0)
                {
                    loggedInUser.UserID = Convert.ToInt64(dt.Rows[0]["UserID"]);
                    loggedInUser.UserTypeID = Convert.ToInt32(dt.Rows[0]["UserTypeID"]);
                    loggedInUser.UserLoginID = Convert.ToString(dt.Rows[0]["UserLoginID"]);
                    loggedInUser.UserName = Convert.ToString(dt.Rows[0]["UserName"]);
                    loggedInUser.IsAdmin = Convert.ToBoolean(dt.Rows[0]["IsAdmin"]);

                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLoggedInUser");
                throw ex;
            }
            return loggedInUser;
        }
    }
}
