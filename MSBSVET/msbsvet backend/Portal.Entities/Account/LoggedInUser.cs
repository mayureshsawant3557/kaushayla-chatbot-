using Portal.Entities.Authorization;
using Portal.Entities.Base;

namespace Portal.Entities.Account
{
    [Serializable]
    public class LoggedInUser
    {
        public Int64 UserID { get; set; }
        public Int32 UserTypeID { get; set; }
        public required string UserLoginID { get; set; }
        public required string UserPassword { get; set; }
        public required string UserName { get; set; }
        public required string DashBoardPath { get; set; }
        public required string PhotoPath { get; set; }
        public Int64 LoggedInSessionID { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsMultipleLoginAllowed { get; set; }
        public Int64 LastLoggedInSessionID { get; set; }
        public Int16 SecurityQuestionID { get; set; }
        public required string ErrorMessage { get; set; }
        public bool IsLoginAllowed { get; set; }
        public BrowserEntity BrowserInfo { get; set; }
        public bool IsPasswordResetDone { get; set; }
        public Int64 ApplicationID { get; set; }
        public Int16 CurrentAdmissionYear { get; set; }
        public string DashBoardPathReact { get; set; }
        public string? AccessToken { get; set; }
        public RefreshToken RefreshToken { get; set; }
        public string? UserTypeCode { get; set; }
        public Int32 MsbsvetMtId { get; set; }


        public LoggedInUser()
        {
            BrowserInfo = new BrowserEntity();
        }
    }

    public class LoggedInUserRequest
    {
        public required string UserLoginID { get; set; }
        public required string UserPassword { get; set; }
        public BrowserEntity BrowserInfo { get; set; }

        public LoggedInUserRequest()
        {
            BrowserInfo = new BrowserEntity();
        }
    }
    public class LoggedInUserAPI
    {
        public Int64 UserID { get; set; }
        public Int32 UserTypeID { get; set; }
        public required string UserLoginID { get; set; }
        public required string UserPassword { get; set; }
        public required string UserName { get; set; }
        public required string DashBoardPath { get; set; }
        public Int64 LoggedInSessionID { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsMultipleLoginAllowed { get; set; }
        public Int64 LastLoggedInSessionID { get; set; }
        public Int16 SecurityQuestionID { get; set; }
        public required string ErrorMessage { get; set; }
        public bool IsLoginAllowed { get; set; }
    }
}