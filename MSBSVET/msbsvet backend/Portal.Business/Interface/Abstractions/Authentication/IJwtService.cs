using Portal.Entities.Account;
using Portal.Entities.Authorization;

namespace Portal.Business.Interface.Abstractions.Authentication;


public interface IJwtService
{
    string GenerateAccessToken(LoggedInUser user,string UserPassword);
    string GenerateAccessToken(LoggedInUser user);
    RefreshToken GenerateRefreshToken(long userId);
}
