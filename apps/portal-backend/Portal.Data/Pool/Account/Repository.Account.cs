using Portal.Entities.Account;
using Portal.Entities.Authorization;
using System.Data;

namespace Portal.Data
{
    public partial class Repository
    {
        //private readonly IDbAccess _dbAccess;

        //public Repository(IDbAccess dbAccess)
        //{
        //    _dbAccess = dbAccess ?? throw new ArgumentNullException(nameof(dbAccess));
        //}

        public DataTable CheckUserExists(LoggedInUser user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", user.UserLoginID ?? string.Empty);
            param.Add("@UserPassword", user.UserPassword ?? string.Empty);
            param.Add("@BrowserName", user.BrowserInfo?.BrowserName ?? string.Empty);
            param.Add("@BrowserVersion", user.BrowserInfo?.BrowserVersion ?? string.Empty);
            param.Add("@IPAddress", user.BrowserInfo?.UserHostAddress ?? string.Empty);

            return _dbAccess.GetDataTable("Account_CheckUserExists", param);
        }

        public DataTable CheckUserExists(LoggedInUserRequest user)
        {
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", user.UserLoginID ?? string.Empty);
            param.Add("@UserPassword", user.UserPassword ?? string.Empty);
            param.Add("@BrowserName", user.BrowserInfo?.BrowserName ?? string.Empty);
            param.Add("@BrowserVersion", !string.IsNullOrEmpty(user.BrowserInfo?.BrowserVersion)
                                        ? user.BrowserInfo.BrowserVersion.Substring(
                                            0, Math.Min(10, user.BrowserInfo.BrowserVersion.Length))
                                        : string.Empty);
            param.Add("@IPAddress", user.BrowserInfo?.UserHostAddress ?? string.Empty);

            return _dbAccess.GetDataTable("Account_CheckUserExists", param);
        }

        public void UpdateLoginStatus(Int64 UserID, Int64 LoggedInSessionID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);
            param.Add("@LoggedInSessionID", LoggedInSessionID);

            _dbAccess.ExecuteNonQuery("Account_UpdateLoginStatus", param);
        }

        public void UpdateLogoutStatus(Int64 UserID, Int64 LoggedInSessionID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);
            param.Add("@LoggedInSessionID", LoggedInSessionID);

            _dbAccess.ExecuteNonQuery("Account_UpdateLogoutStatus", param);
        }

        public DataTable CheckForgotPassword(ForgotPasswordEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", entity.UserLoginID ?? string.Empty);
            param.Add("@SecurityQuestionID", entity.SecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", entity.SecurityQuestionAnswer ?? string.Empty);

            return _dbAccess.GetDataTable("Account_CheckForgotPassword", param);
        }

        public DataTable CheckForgotPassword(string UserLoginID, string MobileNo)
        {
            if (string.IsNullOrEmpty(UserLoginID))
                throw new ArgumentException("UserLoginID cannot be null or empty.", nameof(UserLoginID));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", UserLoginID);
            param.Add("@MobileNo", MobileNo ?? string.Empty);

            return _dbAccess.GetDataTable("Account_CheckForgotPasswordByOTP", param);
        }

        public string ResetPassword(ForgotPasswordEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", entity.UserLoginID ?? string.Empty);
            param.Add("@NewPassword", entity.NewPassword ?? string.Empty);
            param.Add("@IPAddress", entity.IPAddress ?? string.Empty);

            object result = _dbAccess.ExecuteScalar("Account_ResetPassword", param);
            return result?.ToString() ?? string.Empty;
        }

        public string UpdateMobileNumber(string UserLoginID, string MobileNo, string IPAddress, string ModifyBy)
        {
            if (string.IsNullOrEmpty(UserLoginID))
                throw new ArgumentException("UserLoginID cannot be null or empty.", nameof(UserLoginID));
            if (string.IsNullOrEmpty(MobileNo))
                throw new ArgumentException("MobileNo cannot be null or empty.", nameof(MobileNo));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", UserLoginID);
            param.Add("@MobileNo", MobileNo);
            param.Add("@IPAddress", IPAddress ?? string.Empty);
            param.Add("@ModifyBy", ModifyBy ?? string.Empty);

            object result = _dbAccess.ExecuteScalar("Account_UpdateMobileNumber", param);
            return result?.ToString() ?? string.Empty;
        }

        public bool IsCurrentLoginValid(Int64 UserID, Int64 LoggedInSessionID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);
            param.Add("@LoggedInSessionID", LoggedInSessionID);

            object result = _dbAccess.ExecuteScalar("Account_IsCurrentLoginValid", param);
            return result != null && Convert.ToBoolean(result);
        }

        public DataTable GetSecurityQuestionDetails(Int64 UserID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);

            return _dbAccess.GetDataTable("Account_GetSecurityQuestionDetails", param);
        }

        public string ResetSecurityQuestion(Int64 UserID, Int16 SecurityQuestionID, string SecurityQuestionAnswer, string UserLoginID, string IPAddress)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));
            if (string.IsNullOrEmpty(SecurityQuestionAnswer))
                throw new ArgumentException("SecurityQuestionAnswer cannot be null or empty.", nameof(SecurityQuestionAnswer));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);
            param.Add("@SecurityQuestionID", SecurityQuestionID);
            param.Add("@SecurityQuestionAnswer", SecurityQuestionAnswer);
            param.Add("@UserLoginID", UserLoginID ?? string.Empty);
            param.Add("@IPAddress", IPAddress ?? string.Empty);

            object result = _dbAccess.ExecuteScalar("Account_ResetSecurityQuestion", param);
            return result?.ToString() ?? string.Empty;
        }

        public string GetPassword(Int64 UserID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);

            object result = _dbAccess.ExecuteScalar("Account_GetPassword", param);
            return result?.ToString() ?? string.Empty;
        }

        public string GetUserName(string UserLoginID)
        {
            if (string.IsNullOrEmpty(UserLoginID))
                throw new ArgumentException("UserLoginID cannot be null or empty.", nameof(UserLoginID));

            var param = new Dictionary<string, object>();

            param.Add("@UserLoginID", UserLoginID);

            object result = _dbAccess.ExecuteScalar("Account_GetUserName", param);
            return result?.ToString() ?? string.Empty;
        }

        public DataTable GetLoggedInUserDetails(Int32 UserTypeID, string UserLoginID)
        {
            if (string.IsNullOrEmpty(UserLoginID))
                throw new ArgumentException("UserLoginID cannot be null or empty.", nameof(UserLoginID));

            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);

            return _dbAccess.GetDataTable("Account_GetLoggedInUserDetails", param);
        }

        public DataTable GetUserListForPasswordGeneration(Int32 UserTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@UserTypeID", UserTypeID);

            return _dbAccess.GetDataTable("Account_GetUserListForPasswordGeneration", param);
        }

        public string UpdateUserPassword(Int64 UserID, string UserPassword, string UserLoginID, string IPAddress)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));
            if (string.IsNullOrEmpty(UserPassword))
                throw new ArgumentException("UserPassword cannot be null or empty.", nameof(UserPassword));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);
            param.Add("@UserPassword", UserPassword);
            param.Add("@UserLoginID", UserLoginID ?? string.Empty);
            param.Add("@IPAddress", IPAddress ?? string.Empty);

            object result = _dbAccess.ExecuteScalar("Account_UpdateUserPassword", param);
            return result?.ToString() ?? string.Empty;
        }

        public string GetUserNameWithCode(Int64 UserID)
        {
            if (UserID <= 0)
                throw new ArgumentException("UserID must be greater than zero.", nameof(UserID));

            var param = new Dictionary<string, object>();

            param.Add("@UserID", UserID);

            object result = _dbAccess.ExecuteScalar("Account_GetUserNameWithCode", param);
            return result?.ToString() ?? string.Empty;
        }

        public string GetUserLoginID(string UserName, string MobileNo)
        {
            if (string.IsNullOrEmpty(UserName))
                throw new ArgumentException("UserName cannot be null or empty.", nameof(UserName));
            if (string.IsNullOrEmpty(MobileNo))
                throw new ArgumentException("MobileNo cannot be null or empty.", nameof(MobileNo));

            var param = new Dictionary<string, object>();

            param.Add("@UserName", UserName);
            param.Add("@MobileNo", MobileNo);

            object result = _dbAccess.ExecuteScalar("Account_GetUserLoginID", param);
            return result?.ToString() ?? string.Empty;
        }

        public DataTable GetUserLoginIDByUserName(string UserName)
        {
            if (string.IsNullOrEmpty(UserName))
                throw new ArgumentException("UserName cannot be null or empty.", nameof(UserName));

            var param = new Dictionary<string, object>();
            param.Add("@UserName", UserName);
            return _dbAccess.GetDataTable("Account_GetUserLoginIDByUserName", param); 
        }
        public void SaveRefreshToken(long userID, string token, DateTime expiresAt)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", userID);
            param.Add("@Token", token);
            param.Add("@ExpiresAt", expiresAt);
            _dbAccess.ExecuteNonQuery("Account_SaveRefreshToken", param);
        }
        public DataTable GetRefreshToken(string refreshToken)
        {
            var param = new Dictionary<string, object>
                {
                    { "@Token", refreshToken }
                };

            return _dbAccess.GetDataTable(
                "Account_GetRefreshToken",
                param
            );
        }
        public DataTable GetRefreshTokenByUserId(long userId)
        {
            var param = new Dictionary<string, object>
                {
                    { "@UserId", userId }
                };

            return _dbAccess.GetDataTable(
                "Account_GetRefreshTokenByUserId",
                param
            );
        }

        public DataTable GetUserById(long userId)
        {
            var param = new Dictionary<string, object>
                {
                    { "@UserID", userId }
                };

            return _dbAccess.GetDataTable(
                   "Account_GetUserById",
                   param
               );
        }
        public DataTable ValidateRefreshToken_GetUser(string refreshToken, bool IsRotate)
        {
            var param = new Dictionary<string, object>
                {
                    { "@Token", refreshToken },
                    { "@IsRotate", IsRotate },
                };

            return _dbAccess.GetDataTable(
                   "Account_ValidateRefreshToken_GetUser",
                   param
               );
        }
        public void RevokeRefreshToken(string refreshToken)
        {
            var param = new Dictionary<string, object>
                {
                    { "@Token", refreshToken }
                };

            _dbAccess.ExecuteNonQuery(
                "Account_RevokeRefreshToken",
                param
            );
        }
        public void RevokeRefreshTokenByUserId(long UserID)
        {
            var param = new Dictionary<string, object>
                {
                    { "@UserID", UserID }
                };

            _dbAccess.ExecuteNonQuery(
                "Account_RevokeRefreshTokenByUserId",
                param
            );
        }
    }
}