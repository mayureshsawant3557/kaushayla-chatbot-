using Portal.Entities.Account;
using Portal.Entities.Administration;
using Portal.Entities.Authorization;
using System.Data;

namespace Portal.Business.Interface.Account
{
    public interface IAccount
    {
        LoggedInUser CheckUserExists(LoggedInUser user);
        LoggedInUser CheckUserExists(LoggedInUserRequest user);
        void UpdateLoginStatus(Int64 UserID, Int64 LoggedInSessionID);
        void UpdateLogoutStatus(Int64 UserID, Int64 LoggedInSessionID);
        ForgotPasswordEntity CheckForgotPassword(ForgotPasswordEntity entity);
        ForgotPasswordEntity CheckForgotPassword(string UserLoginID, string MobileNo);
        string ResetPassword(ForgotPasswordEntity entity);
        string UpdateMobileNumber(string UserLoginID, string MobileNo, string IPAddress, string ModifyBy);
        bool IsCurrentLoginValid(Int64 UserID, Int64 LoggedInSessionID);
        DataTable GetSecurityQuestionDetails(Int64 UserID);
        string ResetSecurityQuestion(Int64 UserID, Int16 SecurityQuestionID, string SecurityQuestionAnswer, string UserLoginID, string IPAddress);
        string GetPassword(Int64 UserID);
        string GetUserName(string UserLoginID);
        DataTable GetLoggedInUserDetails(Int32 UserTypeID, string UserLoginID);
        LoggedInUser GetLoggedInUser(int UserTypeID, string UserLoginID);
        List<UserEntity> GetUserListForPasswordGeneration(Int32 UserTypeID);
        string UpdateUserPassword(Int64 UserID, string UserPassword, string UserLoginID, string IPAddress);
        string GetUserNameWithCode(Int64 UserID);
        string GetUserLoginID(string UserName, string MobileNo);
        DataTable GetUserLoginIDByUserName(string UserName);
        void SaveRefreshToken(long userID, string token, DateTime expiresAt);
        RefreshToken GetRefreshToken(string refreshToken);
        RefreshToken GetRefreshTokenByUserId(long userId);
        LoggedInUser GetUserById(long userId);
        void RevokeRefreshToken(string refreshToken);
        void RevokeRefreshTokenByUserId(long userID); 
        LoggedInUser VerifyRefreshTokenAndGetUser(string refreshToken, bool IsRotate);
    }
}
