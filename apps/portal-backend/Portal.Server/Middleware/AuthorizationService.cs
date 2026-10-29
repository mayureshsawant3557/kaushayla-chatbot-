using Portal.Business.Interface.Account;
using Portal.Entities.Account;

namespace Portal.Server.Middleware;

public class AuthorizationService
{
    private readonly IAccount _account;

    public AuthorizationService(IAccount account)
    {
       _account = account;
    }

    public async Task<LoggedInUser> GetForUserAsync(string userLoginId,string password)
    {
        var loginRequest = new LoggedInUser
        {
            UserLoginID = userLoginId,
            UserPassword = password,
            UserName = "", // These required properties will be populated by the service
            DashBoardPath = "",
            PhotoPath = "",
            ErrorMessage = ""
        };

        var userDetails = _account.CheckUserExists(loginRequest);
        return await Task.FromResult(userDetails);
    }
}