using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Portal.Server.Middleware;

public sealed class ValidUserAuthorizationHandler
    : AuthorizationHandler<ValidUserRequirement>
{
    private readonly AuthorizationService _authorizationService;

    public ValidUserAuthorizationHandler(
        AuthorizationService authorizationService)
    {
        _authorizationService = authorizationService;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        ValidUserRequirement requirement)
    {
        if (!context.User.Identity?.IsAuthenticated ?? true)
            return;

        string? userLoginId = context.User?.Claims
                 .FirstOrDefault(c => c.Type == "userLoginId")?.Value
                 ?? context.User?.Claims
                 .FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;

        string? userTypeIdValue = context.User?.Claims
                    .FirstOrDefault(c => c.Type == "userTypeID")?.Value;

        if (string.IsNullOrEmpty(userLoginId) ||
            string.IsNullOrEmpty(userTypeIdValue))
            return;

        int userTypeId = Convert.ToInt32(userTypeIdValue);

        string? password=  context.User?.Claims
                 .FirstOrDefault(c => c.Type == "password")?.Value;

        var user =
            await _authorizationService.GetForUserAsync(userLoginId, password);

        //var user =
        //    await _authorizationService.GetForUserAsync(userTypeId, userLoginId);

        if (user is null)
            return;

        // ✅ USER IS VALID
        context.Succeed(requirement);
    }
}

public sealed class ValidUserRequirement : IAuthorizationRequirement
{
}
