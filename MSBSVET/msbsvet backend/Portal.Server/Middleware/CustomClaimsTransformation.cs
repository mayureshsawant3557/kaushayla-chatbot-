using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;
using System.Security;
using System.Security.Claims;
using Twilio.TwiML.Voice;

namespace Portal.Server.Middleware;

internal sealed class CustomClaimsTransformation : IClaimsTransformation
{
    private readonly IServiceProvider _serviceProvider;

    public CustomClaimsTransformation(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not { IsAuthenticated: true })
            return principal;

        // Prevent duplicate role loading
        if (principal.HasClaim(c => c.Type == ClaimTypes.NameIdentifier))
            return principal;

        string? identityId = principal.FindFirstValue(
            JwtRegisteredClaimNames.Sub);

        if (string.IsNullOrWhiteSpace(identityId))
            return principal;

        using IServiceScope scope = _serviceProvider.CreateScope();

        int userID = Convert.ToInt32(principal.FindFirstValue("userTypeID"));

        var authorizationService =
            scope.ServiceProvider.GetRequiredService<AuthorizationService>();

        string? password = principal.FindFirstValue("password");

        // 4️⃣ Load minimal user data
        var user = await authorizationService.GetForUserAsync(identityId, password);

        if (user is null)
            return principal;

        // 5️⃣ Enrich claims
        var claimsIdentity = new ClaimsIdentity();

        claimsIdentity.AddClaim(
            new Claim(JwtRegisteredClaimNames.Sub, user.UserLoginID.ToString()));

        claimsIdentity.AddClaim(
            new Claim(JwtRegisteredClaimNames.Name, user.UserName));

        principal.AddIdentity(claimsIdentity);

        return principal;
    }
}