using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Portal.Business.Interface.Abstractions.Authentication;
using Portal.Entities.Account;
using Portal.Entities.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Portal.Business.Worker.Abstractions.Authentication;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;

        JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
        JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.Clear();
    }

    public string GenerateAccessToken(LoggedInUser user, string UserPassword)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]!)
        );

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        string redirectUrl = null;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserLoginID.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Name, user.UserLoginID),
            new(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new(ClaimTypes.Name, user.UserLoginID.ToString()),
            new("userLoginId", user.UserLoginID.ToString()),
            //new("password", UserPassword),
            new("userTypeID", user.UserTypeID.ToString()),
            new("userID", user.UserID.ToString())
        };

        if (!string.IsNullOrEmpty(redirectUrl))
        {
            claims.Add(new Claim("redirectUrl", redirectUrl));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(
                double.Parse(jwtSettings["ExpiryMinutes"]!)
            ),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateAccessToken(LoggedInUser user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]!)
        );

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        string redirectUrl = null;

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserLoginID.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Name, user.UserLoginID),
            new(ClaimTypes.NameIdentifier, user.UserID.ToString()),
            new(ClaimTypes.Name, user.UserLoginID.ToString()),
            new("userLoginId", user.UserLoginID.ToString()),
            //new("password", UserPassword),
            new("userTypeID", user.UserTypeID.ToString())
        };

        if (!string.IsNullOrEmpty(redirectUrl))
        {
            claims.Add(new Claim("redirectUrl", redirectUrl));
        }

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddMinutes(
                double.Parse(jwtSettings["ExpiryMinutes"]!)
            ),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public RefreshToken GenerateRefreshToken(long userId)
    {
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        int expiryMinutes = int.Parse(_configuration["Jwt:RefreshTokenExpiryMinutes"]!);

        return new RefreshToken
        {
            UserId = userId,
            Token = refreshToken,
            CreatedAt = DateTime.Now,
            ExpiresAt = DateTime.Now.AddMinutes(expiryMinutes)
            //ExpiresAt = DateTime.Now.AddDays(
            //    int.Parse(_configuration["Jwt:RefreshTokenExpiryDays"]!)
            //)
        };
    }
}