using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Exchange.WebServices.Data;
using Microsoft.IdentityModel.Tokens;
using Microsoft.ReportingServices.ReportProcessing.ReportObjectModel;
using Portal.Business.Interface.Abstractions.Authentication;
using Portal.Business.Interface.Account;
using Portal.Business.Interface.Attendance;
using Portal.Business.Worker.Base;
using Portal.Entities.Account;
using Portal.Entities.Administration;
using Portal.Entities.Authorization;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Portal.Web.Controllers;

[Route("api/[controller]")]
[ApiController]

public class AccountController : ControllerBase
{
    private readonly IAccount _accountService;
    private readonly IConfiguration _configuration;
    private readonly IJwtService _jwtService;
    private readonly IAttendance _attendanceService;

    private readonly RSA _rsa;
    public AccountController(IAccount accountService, IConfiguration configuration, IJwtService jwtService, IAttendance attendanceService, RSA rsa)
    {
        _accountService = accountService ?? throw new ArgumentNullException(nameof(accountService));
        _configuration = configuration;
        _jwtService = jwtService;
        _attendanceService = attendanceService ?? throw new ArgumentNullException(nameof(attendanceService));
        _rsa = rsa;
    }

    [HttpGet("token")]

    public IActionResult GetToken()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        return Ok(new
        {
            AuthorizationHeader = authHeader
        });
    }
    [AllowAnonymous]
    [HttpGet("generateRefershToken")]
    public IActionResult GenerateRefershToken(long UserID)
    {
        var refreshToken = _jwtService.GenerateRefreshToken(UserID);

        // ✅ Persist refresh token
        _accountService.SaveRefreshToken(
            UserID,
            refreshToken.Token,
            refreshToken.ExpiresAt
        );
        //SetAccessTokenCookie(AccessToken);
        SetRefreshTokenCookie(refreshToken.Token);
        return Ok(refreshToken);
    }
    [AllowAnonymous]
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoggedInUserRequest user)
    {
        try
        {
            if (user == null)
            {
                return BadRequest("User information is required");
            }

            var loggedInUser = _accountService.CheckUserExists(user);

            if (loggedInUser.IsLoginAllowed)
            {
                loggedInUser.AccessToken = _jwtService.GenerateAccessToken(loggedInUser, user.UserPassword);
                loggedInUser.RefreshToken = _jwtService.GenerateRefreshToken(loggedInUser.UserID);

                // ✅ Persist refresh token
                _accountService.SaveRefreshToken(
                    loggedInUser.UserID,
                    loggedInUser.RefreshToken.Token,
                    loggedInUser.RefreshToken.ExpiresAt
                );
                //SetAccessTokenCookie(AccessToken);
                SetRefreshTokenCookie(loggedInUser.RefreshToken.Token);
                // Update login status
                _accountService.UpdateLoginStatus(loggedInUser.UserID, loggedInUser.LoggedInSessionID);
                return Ok(loggedInUser);
            }
            else
            {
                return Unauthorized(new
                {
                    success = false,
                    message = loggedInUser.ErrorMessage,
                    code = "AUTH_INVALID"
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    // added for testing 
    //[AllowAnonymous]
    //[HttpPost("login")]
    //public IActionResult Login([FromBody] LoggedInUserRequest user)
    //{
    //    var loggedInUser = _accountService.CheckUserExists(user);

    //    if (!loggedInUser.IsLoginAllowed)
    //        return Unauthorized();

    //    var accessToken = _jwtService.GenerateAccessToken(loggedInUser);
    //    var refreshToken = _jwtService.GenerateRefreshToken(loggedInUser.UserID);

    //    _accountService.SaveRefreshToken(
    //        loggedInUser.UserID,
    //        refreshToken.Token,
    //        refreshToken.ExpiresAt
    //    );

    //    SetAccessTokenCookie(accessToken);
    //    SetRefreshTokenCookie(refreshToken.Token);

    //    return Ok(new
    //    {
    //        profileId = loggedInUser.UserID,
    //        userType = loggedInUser.UserTypeID,
    //        name = loggedInUser.UserName
    //    });
    //}

    // Login for app user
    [AllowAnonymous]
    [HttpPost("applogin")]
    public IActionResult AppLogin([FromBody] LoggedInUserRequest user)
    {
        try
        {
            if (user == null)
            {
                return BadRequest("User information is required");
            }

            var loggedInUser = _accountService.CheckUserExists(user);

            if (loggedInUser.IsLoginAllowed)
            {
                loggedInUser.AccessToken = _jwtService.GenerateAccessToken(loggedInUser, user.UserPassword);
                loggedInUser.RefreshToken = _jwtService.GenerateRefreshToken(loggedInUser.UserID);
                var UserProfile = _attendanceService.GetUserProfile(loggedInUser.UserID, loggedInUser.UserTypeID);

                // ✅ Persist refresh token
                _accountService.SaveRefreshToken(
                    loggedInUser.UserID,
                    loggedInUser.RefreshToken.Token,
                    loggedInUser.RefreshToken.ExpiresAt
                );
                //SetAccessTokenCookie(AccessToken);
                SetRefreshTokenCookie(loggedInUser.RefreshToken.Token);
                // Update login status
                _accountService.UpdateLoginStatus(loggedInUser.UserID, loggedInUser.LoggedInSessionID);
                return Ok(new
                {
                    loggedInUser.UserID,
                    loggedInUser.UserTypeID,
                    loggedInUser.UserLoginID,
                    loggedInUser.IsAdmin,
                    loggedInUser.IsLoginAllowed,
                    loggedInUser.PhotoPath,
                    loggedInUser.LoggedInSessionID,
                    loggedInUser.AccessToken,
                    User = UserProfile
                });
            }
            else
            {
                return Unauthorized(new
                {
                    success = false,
                    message = loggedInUser.ErrorMessage,
                    code = "AUTH_INVALID"
                });
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    // added for testing 
    [Authorize]
[HttpGet("me")]
public IActionResult GetCurrentUser()
{
    try
    {
        // Get UserID from JWT claim
        var userIdClaim = User.FindFirst("UserID")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            return Unauthorized(new { message = "Invalid token" });

        long userId = Convert.ToInt64(userIdClaim);

        // Fetch user from database
        var user = _accountService.GetUserById(userId);

        if (user == null)
            return NotFound(new { message = "User not found" });

        // Return only safe fields
        return Ok(new
        {
            userId = user.UserID,
            userTypeId = user.UserTypeID,
            userType = user.UserTypeCode,
            userName = user.UserName,
            dashboard = user.DashBoardPathReact,
            isAdmin = user.IsAdmin,
            photoPath = user.PhotoPath
        });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new
        {
            message = "Internal server error",
            error = ex.Message
        });
    }
}
// Add this new model class alongside other request models
public class AutoLoginRequest
    {
        public string JwtToken { get; set; }
    }
    public record RefreshTokenRequest(string RefreshToken);
    [AllowAnonymous]
    [HttpPost("refresh-token")]
    //public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequest request)
    //{
    public IActionResult RefreshToken()
    {
        // 🍪 Read refresh token from HttpOnly cookie
        var refreshToken = Request.Cookies["refreshToken"];

        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized("Refresh token missing");

        bool IsRotationRefreshTokenRequired = bool.Parse(_configuration["Jwt:RotationRefreshTokenRequired"]!);

        var user = _accountService.VerifyRefreshTokenAndGetUser(refreshToken, IsRotationRefreshTokenRequired);
        if (user == null)
            return Unauthorized("User not found");

        // 🔑 Generate new access token
        var newAccessToken = _jwtService.GenerateAccessToken(user);

        var newRefreshToken = refreshToken;
        if (IsRotationRefreshTokenRequired)
        {
            // 🔁 ROTATE refresh token
            var tokenData = _jwtService.GenerateRefreshToken(user.UserID);

            newRefreshToken = tokenData.Token;
            _accountService.RevokeRefreshToken(refreshToken);

            _accountService.SaveRefreshToken(
                user.UserID,
                tokenData.Token,
                tokenData.ExpiresAt
            );
        }
        //// 🍪 Set new refresh token cookie
        SetRefreshTokenCookie(newRefreshToken);

        return Ok(new
        {
            AccessToken = newAccessToken
            //RefreshToken = newRefreshToken
        });
    }

    // added for testing 
    //[HttpPost("refresh-token")]
    //public IActionResult RefreshToken()
    //{
    //    var refreshToken = Request.Cookies["refreshToken"];

    //    if (string.IsNullOrEmpty(refreshToken))
    //        return Unauthorized();

    //    var user = _accountService.VerifyRefreshTokenAndGetUser(refreshToken, true);

    //    if (user == null)
    //        return Unauthorized();

    //    var newAccessToken = _jwtService.GenerateAccessToken(user);

    //    SetAccessTokenCookie(newAccessToken);

    //    return Ok(new { success = true });
    //}

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var options = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(1),
            Path = "/"
            // Domain = ".msbsvet.edu.in"   // use only in production
        };

        Response.Cookies.Append("refreshToken", refreshToken, options);
    }
    private void SetAccessTokenCookie(string token)
    {
        Response.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,           // HTTPS only
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddMinutes(15)
        });
    }



    // TESTING 

    //private void SetAccessTokenCookie(string token)
    //{
    //    Response.Cookies.Append("access_token", token, new CookieOptions
    //    {
    //        HttpOnly = true,
    //        Secure = true,
    //        SameSite = SameSiteMode.None,
    //        Expires = DateTime.UtcNow.AddMinutes(15),
    //        Path = "/"
    //    });
    //}

    //private void SetRefreshTokenCookie(string refreshToken)
    //{
    //    Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
    //    {
    //        HttpOnly = true,
    //        Secure = true,
    //        SameSite = SameSiteMode.None,
    //        Expires = DateTime.UtcNow.AddDays(7),
    //        Path = "/"
    //    });
    //}
    //[AllowAnonymous]
    //[HttpPost("refresh-token")]
    //public async Task<IActionResult> RefreshToken(RefreshTokenRequest request)
    //{
    //    RefreshToken tokenData = _accountService.GetRefreshToken(request.RefreshToken);

    //    if (tokenData == null)
    //        return Unauthorized("Invalid refresh token");

    //    if (tokenData.IsRevoked)
    //        return Unauthorized("Refresh token revoked");

    //    if (tokenData.ExpiresAt < DateTime.Now)
    //    {
    //        _accountService.RevokeRefreshToken(request.RefreshToken);
    //        return Unauthorized("Invalid refresh expired");
    //    }

    //    var user = _accountService.GetUserById(tokenData.UserId);

    //    if (user == null)
    //        return Unauthorized("User not found");

    //    var newAccessToken = _jwtService.GenerateAccessToken(user);
    //    //var newRefreshToken = _jwtService.GenerateRefreshToken(user.UserID);

    //    // Rotate token
    //    //_accountService.RevokeRefreshToken(request.RefreshToken);
    //    //_accountService.SaveRefreshToken(
    //    //    user.UserID,
    //    //    newRefreshToken.Token,
    //    //    newRefreshToken.ExpiresAt
    //    //);

    //    return Ok(new
    //    {
    //        AccessToken = newAccessToken,
    //        RefreshToken = request.RefreshToken
    //    });
    //}

    // Add this new endpoint in AccountController
    [AllowAnonymous]
    [HttpPost("auto-login")]
    public IActionResult AutoLogin([FromBody] AutoLoginRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrEmpty(request.JwtToken))
            {
                return BadRequest("JWT token is required");
            }

            // Parse and validate the JWT token
            var handler = new JwtSecurityTokenHandler();
            var jsonToken = handler.ReadToken(request.JwtToken) as JwtSecurityToken;

            if (jsonToken == null)
            {
                return BadRequest("Invalid JWT token");
            }

            // Extract user information from claims
            var userLoginId = jsonToken.Claims.FirstOrDefault(c => c.Type == "userLoginId")?.Value;
            var password = jsonToken.Claims.FirstOrDefault(c => c.Type == "password")?.Value;
            var redirectUrl = jsonToken.Claims.FirstOrDefault(c => c.Type == "redirectUrl")?.Value;

            if (string.IsNullOrEmpty(userLoginId) || string.IsNullOrEmpty(password))
            {
                return BadRequest("Token missing required user credentials");
            }

            // Create login request using existing LoggedInUser model
            var loginRequest = new LoggedInUser
            {
                UserLoginID = userLoginId,
                UserPassword = password,
                UserName = "", // These required properties will be populated by the service
                DashBoardPath = "",
                PhotoPath = "",
                ErrorMessage = ""
            };

            // Use existing login logic
            var loggedInUser = _accountService.CheckUserExists(loginRequest);


            if (loggedInUser.IsLoginAllowed)
            {
                //loggedInUser.AccessToken = request.JwtToken;
                //changes done for JWT authentication issue from aspx to react redirection.
                loggedInUser.AccessToken = _jwtService.GenerateAccessToken(loggedInUser);

                loggedInUser.RefreshToken = _accountService.GetRefreshTokenByUserId(loggedInUser.UserID);
                if (loggedInUser.RefreshToken == null)
                {
                    loggedInUser.RefreshToken = _jwtService.GenerateRefreshToken(loggedInUser.UserID);
                }
                SetRefreshTokenCookie(loggedInUser.RefreshToken.Token);
                // Update login status
                _accountService.UpdateLoginStatus(loggedInUser.UserID, loggedInUser.LoggedInSessionID);

                // Return success with redirect URL
                return Ok(new
                {
                    user = loggedInUser,
                    redirectUrl = redirectUrl ?? loggedInUser.DashBoardPath // Fallback to default dashboard if no redirect URL
                });
            }
            else
            {
                return Unauthorized(loggedInUser.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout([FromBody] LogoutRequest request)
    {
        try
        {
            if (request == null || request.UserID <= 0)
            {
                return BadRequest("User ID is required");
            }
            Response.Cookies.Delete("refreshToken", new CookieOptions
            {
                Path = "/",
                SameSite = SameSiteMode.None,
                Secure = true
            });

            _accountService.RevokeRefreshTokenByUserId(request.UserID);

            _accountService.UpdateLogoutStatus(request.UserID, request.LoggedInSessionID);
            return Ok($"Logout successful {request.UserID}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [AllowAnonymous]
    [HttpPost("forgotPassword")]
    public IActionResult ForgotPassword([FromBody] ForgotPasswordEntity entity)
    {
        try
        {
            if (entity == null)
            {
                return BadRequest("Required information is missing");
            }

            var result = _accountService.CheckForgotPassword(entity);

            if (string.IsNullOrEmpty(result.ErrorMessage))
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }


    //[HttpPost("resetPassword")]
    //public async Task<IActionResult> ResetPasswordWithSecurityQuestion([FromBody] ResetPasswordRequest request)
    //{
    //    try
    //    {
    //        // Validate the request
    //        if (string.IsNullOrEmpty(request.UserLoginID) ||
    //            request.SecurityQuestionID <= 0 ||
    //            string.IsNullOrEmpty(request.SecurityQuestionAnswer) ||
    //            string.IsNullOrEmpty(request.NewPassword))
    //        {
    //            return BadRequest(new { Success = false, ErrorMessage = "Invalid request parameters" });
    //        }

    //        // Hash the password
    //        string hashedPassword = HashPassword(request.NewPassword);

    //        // Create database connection
    //        using (var connection = new SqlConnection(_dbAccess.BaseConnectionString))
    //        {
    //            connection.Open(); // Synchronous open

    //            // First, verify the security question and answer
    //            var verifyQuery = @"
    //SELECT COUNT(1) 
    //FROM [MSBVE_Staging_UAT].[dbo].[Master_User] 
    //WHERE UserLoginID = @UserLoginID 
    //AND SecurityQuestionID = @SecurityQuestionID 
    //AND SecurityQuestionAnswer = @SecurityQuestionAnswer
    //AND IsActive = 1";

    //            int matchCount = connection.ExecuteScalar<int>(verifyQuery, new
    //            {
    //                request.UserLoginID,
    //                request.SecurityQuestionID,
    //                request.SecurityQuestionAnswer
    //            });

    //            if (matchCount == 0)
    //            {
    //                return BadRequest(new { Success = false, ErrorMessage = "Invalid Profile ID, security question, or answer" });
    //            }

    //            // If verification successful, update the password
    //            var updateQuery = @"
    //UPDATE [MSBVE_Staging_UAT].[dbo].[Master_User]
    //SET UserPassword = @UserPassword,
    //    IsPasswordResetDone = 1,
    //    ModifiedDateTime = GETDATE(),
    //    ModifiedByIPAddress = @IPAddress,
    //    IsAccountLock = 0,
    //    LoginAttempt = 0
    //WHERE UserLoginID = @UserLoginID";

    //            int rowsAffected = connection.Execute(updateQuery, new
    //            {
    //                UserPassword = hashedPassword,
    //                request.UserLoginID,
    //                request.IPAddress
    //            });

    //            if (rowsAffected > 0)
    //            {
    //                return Ok(new { Success = true, Message = "Password reset successful" });
    //            }
    //            else
    //            {
    //                return BadRequest(new { Success = false, ErrorMessage = "Failed to update password" });
    //            }
    //        }
    //    }
    //    catch (Exception ex)
    //    {
    //        // Log the exception
    //        Console.WriteLine($"Error in ResetPasswordWithSecurityQuestion: {ex.Message}");
    //        return StatusCode(500, new { Success = false, ErrorMessage = "An error occurred while processing your request" });
    //    }
    //}

    // Helper method to hash the password
    private string HashPassword(string password)
    {
        using (SHA256 sha256 = SHA256.Create())
        {
            byte[] hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));

            // Convert the byte array to a string
            StringBuilder builder = new StringBuilder();
            for (int i = 0; i < hashedBytes.Length; i++)
            {
                builder.Append(hashedBytes[i].ToString("x2"));
            }
            return builder.ToString();
        }
    }

    [AllowAnonymous]
    [HttpPost("forgotPasswordByOTP")]
    public IActionResult ForgotPasswordByOTP([FromBody] OTPForgotPasswordRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrEmpty(request.UserLoginID) || string.IsNullOrEmpty(request.MobileNo))
            {
                return BadRequest("UserLoginID and MobileNo are required");
            }

            var result = _accountService.CheckForgotPassword(request.UserLoginID, request.MobileNo);

            if (string.IsNullOrEmpty(result.ErrorMessage))
            {
                return Ok(result);
            }
            else
            {
                return BadRequest(result.ErrorMessage);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [AllowAnonymous]
    [HttpPost("resetPassword")]
    public IActionResult ResetPassword([FromBody] ForgotPasswordEntity entity)
    {
        try
        {
            if (entity == null || string.IsNullOrEmpty(entity.UserLoginID) || string.IsNullOrEmpty(entity.NewPassword))
            {
                return BadRequest("Required information is missing");
            }

            string result = _accountService.ResetPassword(entity);

            if (result.ToUpper() == "Y")
            {
                return Ok("Password has been reset successfully");
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("updateMobileNumber")]
    public IActionResult UpdateMobileNumber([FromBody] UpdateMobileNumberRequest request)
    {
        try
        {
            if (request == null || string.IsNullOrEmpty(request.UserLoginID) || string.IsNullOrEmpty(request.MobileNo))
            {
                return BadRequest("UserLoginID and MobileNo are required");
            }

            string result = _accountService.UpdateMobileNumber(request.UserLoginID, request.MobileNo, request.IPAddress, request.ModifyBy);

            if (result.ToUpper() == "Y")
            {
                return Ok("Mobile number has been updated successfully");
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("isCurrentLoginValid")]
    public IActionResult IsCurrentLoginValid([FromQuery] long userId, [FromQuery] long sessionId)
    {
        try
        {
            if (userId <= 0)
            {
                return BadRequest("User ID must be greater than zero");
            }

            bool isValid = _accountService.IsCurrentLoginValid(userId, sessionId);
            return Ok(isValid);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    [AllowAnonymous]
    [HttpGet("securityQuestions/{userId}")]
    public IActionResult GetSecurityQuestionDetails(long userId)
    {
        // Convert only when needed
        try
        {
            if (userId <= 0)
            {
                return BadRequest("User ID must be greater than zero");
            }

            DataTable securityQuestions = _accountService.GetSecurityQuestionDetails(userId);
            var serializableData = BaseWorker.ConvertDataTableToList(securityQuestions);
            return Ok(serializableData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("resetSecurityQuestion")]
    public IActionResult ResetSecurityQuestion([FromBody] ResetSecurityQuestionRequest request)
    {
        try
        {
            if (request == null || request.UserID <= 0 || string.IsNullOrEmpty(request.SecurityQuestionAnswer))
            {
                return BadRequest("Required information is missing");
            }

            string result = _accountService.ResetSecurityQuestion(
                request.UserID,
                request.SecurityQuestionID,
                request.SecurityQuestionAnswer,
                request.UserLoginID,
                request.IPAddress);

            if (result.ToUpper() == "Y")
            {
                return Ok("Security question has been reset successfully");
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    //[HttpGet("password")]
    //public IActionResult GetPassword()
    //{
    //    try
    //    {
    //        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    //        if (string.IsNullOrEmpty(userIdClaim))
    //            return Unauthorized();

    //        long userId = long.Parse(userIdClaim);

    //        if (userId <= 0)
    //        {
    //            return BadRequest("User ID must be greater than zero");
    //        }

    //        string password = _accountService.GetPassword(userId);
    //        return Ok(new { Password = password });
    //    }
    //    catch (Exception ex)
    //    {
    //        return StatusCode(500, $"Internal server error: {ex.Message}");
    //    }
    //}
    [HttpGet("password")]
    public IActionResult GetPassword()
    {
        try
        {
            var userIdClaim = User.FindFirst("userID")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return BadRequest("UserID claim not found");

            if (!long.TryParse(userIdClaim, out long userId))
                return BadRequest("Invalid User ID format");

            string password = _accountService.GetPassword(userId);

            return Ok(new { Password = password });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [AllowAnonymous]
    [HttpGet("username/{userLoginId}")]
    public IActionResult GetUserName(string userLoginId)
    {
        try
        {
            if (string.IsNullOrEmpty(userLoginId))
            {
                return BadRequest("User Login ID is required");
            }

            string userName = _accountService.GetUserName(userLoginId);
            return Ok(new { UserName = userName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("userDetails")]
    public IActionResult GetLoggedInUserDetails([FromQuery] int userTypeId, [FromQuery] string userLoginId)
    {
        try
        {
            if (string.IsNullOrEmpty(userLoginId))
            {
                return BadRequest("User Login ID is required");
            }

            DataTable userDetails = _accountService.GetLoggedInUserDetails(userTypeId, userLoginId);
            var serializableData = BaseWorker.ConvertDataTableToList(userDetails); // Convert only when needed
            return Ok(serializableData);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("usersForPasswordGeneration/{userTypeId}")]
    public IActionResult GetUserListForPasswordGeneration(int userTypeId)
    {
        try
        {
            List<UserEntity> users = _accountService.GetUserListForPasswordGeneration(userTypeId);
            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpPost("updatePassword")]
    public IActionResult UpdateUserPassword([FromBody] UpdatePasswordRequest request)
    {
        try
        {
            //if (request == null || request.UserID <= 0 || string.IsNullOrEmpty(request.UserPassword))
            //{
            //    return BadRequest("Required information is missing");
            //}

            string result = _accountService.UpdateUserPassword(
                request.UserID,
                request.UserPassword,
                request.UserLoginID,
                request.IPAddress);

            if (result.ToUpper() == "Y")
            {
                return Ok("Password has been updated successfully");
            }
            else
            {
                return BadRequest(result);
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("userNameWithCode/{userId}")]
    public IActionResult GetUserNameWithCode(long userId)
    {
        try
        {
            if (userId <= 0)
            {
                return BadRequest("User ID must be greater than zero");
            }

            string userNameWithCode = _accountService.GetUserNameWithCode(userId);
            return Ok(new { UserNameWithCode = userNameWithCode });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [HttpGet("userLoginIdsByName/{userName}")]
    public IActionResult GetUserLoginIDByUserName(string userName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(userName))
            {
                return BadRequest("User Name is required");
            }

            DataTable dt = _accountService.GetUserLoginIDByUserName(userName);

            if (dt == null || dt.Rows.Count == 0)
            {
                return NotFound("No user found");
            }

            var users = dt.AsEnumerable()
                .Select(row => new
                {
                    UserLoginID = row["UserLoginID"]?.ToString(),
                    UserName = row["UserName"]?.ToString(),
                    UserMobileNo = row["UserMobileNo"]?.ToString()
                })
                .ToList();

            return Ok(users);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
    [AllowAnonymous]
    [HttpGet("userLoginId")]
    public IActionResult GetUserLoginID([FromQuery] string userName, [FromQuery] string mobileNo)
    {
        try
        {
            if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(mobileNo))
            {
                return BadRequest("User Name and Mobile Number are required");
            }

            string userLoginId = _accountService.GetUserLoginID(userName, mobileNo);
            return Ok(new { UserLoginID = userLoginId });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    [AllowAnonymous]
    [HttpGet("generate-token")]
    public IActionResult GenerateTestToken(
[FromQuery] string userLoginId,
[FromQuery] string password,
[FromQuery] string redirectUrl = null)
    {
        try
        {
            // Read values from appsettings.json
            var key = _configuration["Jwt:Key"];
            var issuer = _configuration["Jwt:Issuer"];
            var audience = _configuration["Jwt:Audience"];
            var expiryMinutes = Convert.ToInt32(_configuration["Jwt:ExpiryMinutes"]);

            var claims = new List<Claim>
    {

        new Claim(ClaimTypes.Name, userLoginId),
        // CRITICAL: Add Sub claim as fallback for principal.FindFirst(JwtRegisteredClaimNames.Sub)
        new Claim(JwtRegisteredClaimNames.Sub, userLoginId),
        // Custom claims expected by ASPX page
        new Claim("userLoginId", userLoginId),
        new Claim("password", password)
    };

            if (!string.IsNullOrEmpty(redirectUrl))
            {
                claims.Add(new Claim("redirectUrl", redirectUrl));
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expiryMinutes),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
            return Ok(new { token = tokenString });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

}
public class RefreshTokenRequest
{
    public string RefreshToken { get; set; } = null!;
}


// Request models
public class LogoutRequest
{
    public long UserID { get; set; }
    public long LoggedInSessionID { get; set; }
}

public class OTPForgotPasswordRequest
{
    public string UserLoginID { get; set; }
    public string MobileNo { get; set; }
}

public class UpdateMobileNumberRequest
{
    public string UserLoginID { get; set; }
    public string MobileNo { get; set; }
    public string IPAddress { get; set; }
    public string ModifyBy { get; set; }
}

public class ResetSecurityQuestionRequest
{
    public long UserID { get; set; }
    public short SecurityQuestionID { get; set; }
    public string SecurityQuestionAnswer { get; set; }
    public string UserLoginID { get; set; }
    public string IPAddress { get; set; }
}

public class UpdatePasswordRequest
{
    public long UserID { get; set; }
    public string UserPassword { get; set; }
    public string UserLoginID { get; set; }
    public string IPAddress { get; set; }

}
//public class ResetPasswordRequest
//{
//    public string UserLoginID { get; set; }
//    public int SecurityQuestionID { get; set; }
//    public string SecurityQuestionAnswer { get; set; }
//    public string NewPassword { get; set; }
//    public string ErrorMessage { get; set; }
//    public string IPAddress { get; set; }
//}