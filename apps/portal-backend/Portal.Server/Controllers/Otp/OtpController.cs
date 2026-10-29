using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Portal.Business.Interface.Administration;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Institute;
using Portal.Business.Interface.Registration;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities.Base;
using Portal.Entities.Institute;
using System.Data;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using static QuestPDF.Helpers.Colors;
using static System.Net.WebRequestMethods;

namespace Portal.Server.Controllers.Otp
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class OTPController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IBase _baseWorker;
        private readonly IRegistration _registrationWorker;
        private readonly IMemoryCache _cache;
        //private readonly IManageUsers _userManagement;
        private readonly IInstituteBase _IInstituteBase;

        public OTPController(IHttpClientFactory httpClientFactory, IBase baseWorker,
                           IRegistration registrationWorker, IMemoryCache cache, IInstituteBase userManagement)
        {
            _httpClientFactory = httpClientFactory;
            _baseWorker = baseWorker;
            _registrationWorker = registrationWorker;
            _cache = cache;
            _IInstituteBase = userManagement;
        }
        [AllowAnonymous]
        [HttpPost("send-mobile-otp")]
        public async Task<IActionResult> SendMobileOTP([FromBody] SendMobileOTPRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.MobileNo) || request.MobileNo.Length != 10)
                {
                    return BadRequest(new { success = false, message = "Invalid Mobile Number." });
                }

                // Check for duplicate first
                var duplicateCheck = await CheckMobileDuplicate(new CheckMobileRequest { MobileNo = request.MobileNo });
                var duplicateResult = duplicateCheck as OkObjectResult;
                if (duplicateResult?.Value is JsonElement jsonElement)
                {
                    if (jsonElement.TryGetProperty("isDuplicate", out var isDuplicateProperty) &&
                        isDuplicateProperty.GetBoolean())
                    {
                        return duplicateCheck;
                    }
                }


                // Get SMS configuration
                var dtEMailSMS = _baseWorker.GetEMailSMS("VerifyCandidateMobileNo", "S");
                if (dtEMailSMS?.Rows.Count == 0)
                {
                    return BadRequest(new { success = false, message = "SMS configuration not found." });
                }

                // Generate secure OTP
                string otp = _baseWorker.GetOTP(request.MobileNo, "VerifyCandidateMobileNo", GenerateSecureOTP(4));
                var messageTemplate = dtEMailSMS.Rows[0]["Message"].ToString();
                var message = messageTemplate.Replace("##OTP##", otp);
                var templateID = dtEMailSMS.Rows[0]["TemplateID"].ToString();
                var purpose = dtEMailSMS.Rows[0]["Purpose"].ToString();

                // Log the message content for debugging (remove in production)
                //Console.WriteLine($"Message Template: {messageTemplate}");
                //Console.WriteLine($"Generated OTP: {otp}");
                //Console.WriteLine($"Final Message: {message}");

                // Hash the OTP for secure storage
                var hashedOtp = HashOTP(otp);

                // Store hashed OTP in cache with expiration
                var cacheKey = $"otp_mobile_{request.MobileNo}";
                var otpData = new OTPData
                {
                    OTP = hashedOtp, // Store hashed OTP
                    GeneratedAt = DateTime.Now,
                    Attempts = 0,
                    IsVerified = false
                };
                _cache.Remove(cacheKey);
                _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

                // Send SMS with plain text OTP
                var smsResult = await SendSMS(request.MobileNo, templateID, message, purpose);

                if (smsResult.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "OTP sent successfully to your mobile number.",
                        expiresIn = 300,
                        // For debugging only - remove in production
                        data = new
                        {
                            otpGenerated = otp,
                            messageContent = message,
                            templateUsed = messageTemplate
                        }
                    });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Failed to send OTP. Please try again." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while sending OTP." });
            }
        }

        //for staff 

        [HttpPost("send-message")]
        public async Task<IActionResult> SendLoginCredentials([FromBody] SendLoginCredentialsRequest request)
        {
            try
            {
                // Validate request
                if (string.IsNullOrEmpty(request.UserLoginID))
                {
                    return BadRequest(new { success = false, message = "UserLoginID is required." });
                }

                // Extract last 6 digits as UserID
                //string userIdStr = request.UserLoginID.Length >= 6
                //    ? request.UserLoginID.Substring(request.UserLoginID.Length - 6)
                //    : request.UserLoginID;

                //if (!int.TryParse(userIdStr, out int userId))
                //{
                //    return BadRequest(new { success = false, message = "Invalid UserLoginID format." });
                //}

                // Get user details
                //var userDetails = _userManagement.GetUserDetails(request.UserID);
                //var userDetails = _IInstituteBase.GetInstitute_PromoterTypeByInstituteID(request.UserID,request.TypeId);

                //if (userDetails == null)
                //{
                //    return NotFound(new { success = false, message = "User not found." });
                //}

                // Check if user is active
                //if (userDetails.IsActive != "Active")
                //{
                //    return BadRequest(new { success = false, message = "User account is not active." });
                //}

                //// Validate mobile and email
                //if (string.IsNullOrEmpty(userDetails.UserMobileNo))
                //{
                //    return BadRequest(new { success = false, message = "User mobile number not found." });
                //}

                //if (string.IsNullOrEmpty(userDetails.UserEMailID))
                //{
                //    return BadRequest(new { success = false, message = "User email not found." });
                //}

                //// Check if password exists
                //if (string.IsNullOrEmpty(userDetails.UserPassword))
                //{
                //    return BadRequest(new { success = false, message = "User password not found." });
                //}

                // Decrypt password
                //string decryptedPassword;
                //try
                //{
                //    decryptedPassword = CommonHelper.Base64Decrypt(userDetails.UserPassword);
                //}
                //catch (Exception ex)
                //{
                //    Console.WriteLine($"Password decryption failed: {ex.Message}");
                //    return StatusCode(500, new { success = false, message = "Error decrypting password." });
                //}

                // Determine configuration key based on user type
                //string smsConfigKey = userDetails.UserType == "Staff"
                //    ? "NewCandidateRegistration"
                //    : "SendCandidateCredentials";

                //string emailConfigKey = userDetails.UserType == "Staff"
                //    ? "NewCandidateRegistration"
                //    : "SendCandidateCredentials";

                bool smsSuccess = false;
                bool emailSuccess = false;

                // Get SMS configuration
                //var dtSMS = _baseWorker.GetEMailSMS(smsConfigKey, "S");


                var entity = new InstituteInputEntity
                {
                    InstituteId = request.UserID,
                    UserLoginID = request.UserLoginID,
                    PageCode = "InspectionRequest"
                };

                var agencyData = _IInstituteBase.GetInstituteInspectionAgencyList(entity);

                string agencyDistrict = "";

                if (agencyData != null && agencyData.Tables.Count > 0 && agencyData.Tables[0].Rows.Count > 0)
                {
                    agencyDistrict = agencyData.Tables[0].Rows[0]["AgencyDistrict"].ToString();
                }
                DataTable dtSMS;
                if (request.UserID == 102)
                {
                     dtSMS = _baseWorker.GetEMailSMS(request.Purpose,request.MessageType,request.UserLoginID, agencyDistrict);


                }
                else
                {
                    dtSMS = _baseWorker.GetEMailSMS(request.Purpose, request.MessageType, request.Name, request.UserLoginID, request.mobileNo);

                }
                if (dtSMS?.Rows.Count == 0)
                {
                    return BadRequest(new { success = false, message = "SMS configuration not found." });
                }

                // Send SMS
                if (dtSMS != null && dtSMS.Rows.Count > 0)
                {
                    // Prepare message with replacements
                    //string smsMessage = dtSMS.Rows[0]["Message"].ToString()
                    //    .Replace("##Password##", decryptedPassword)
                    //    .Replace("##UserLoginID##", userDetails.UserLoginID)
                    //    .Replace("##FirstName##", GetFirstName(userDetails.UserName))
                    //    .Replace("##UserName##", userDetails.UserName ?? "")
                    //    .Replace("##MobileNo##", userDetails.UserMobileNo);

                    // Get template and purpose
                    string templateID = dtSMS.Rows[0]["TemplateID"].ToString();
                    string purpose = dtSMS.Rows[0]["Purpose"].ToString();
                    string smsMessage = dtSMS.Rows[0]["Message"].ToString();

                    // Log for debugging (remove in production)
                    //Console.WriteLine($"Sending SMS to: {userDetails.UserMobileNo}");
                    //Console.WriteLine($"SMS Message: {smsMessage}");

                    // Send SMS using your method
                    var smsResult = await SendSMS(request.mobileNo, templateID, smsMessage, purpose);

                    if (smsResult.Success)
                    {
                        smsSuccess = true;
                        //Console.WriteLine($"SMS sent successfully to: {userDetails.UserMobileNo}");
                    }
                    else
                    {
                        Console.WriteLine($"SMS sending failed: {smsResult.Message}");
                    }
                }

                // Get Email configuration
                //var dtEmail = _baseWorker.GetEMailSMS(emailConfigKey, "E");

                // Send Email
                //if (dtEmail != null && dtEmail.Rows.Count > 0)
                //{
                //    // Prepare email message with replacements
                //    string emailMessage = dtEmail.Rows[0]["Message"].ToString()
                //        .Replace("##Password##", decryptedPassword)
                //        .Replace("##UserLoginID##", userDetails.UserLoginID)
                //        .Replace("##FirstName##", GetFirstName(userDetails.UserName))
                //        .Replace("##UserName##", userDetails.UserName ?? "")
                //        .Replace("##MobileNo##", userDetails.UserMobileNo)
                //        .Replace("##EMailID##", userDetails.UserEMailID);

                //    string subject = dtEmail.Rows[0]["Subject"].ToString();
                //    string emailPurpose = dtEmail.Rows[0]["Purpose"].ToString();

                //    // Log for debugging (remove in production)
                //    Console.WriteLine($"Sending Email to: {userDetails.UserEMailID}");
                //    Console.WriteLine($"Email Subject: {subject}");

                //    // Send Email using your method
                //    var emailResult = await SendEmail(userDetails.UserEMailID, subject, emailMessage, emailPurpose);

                //    if (emailResult.Success)
                //    {
                //        emailSuccess = true;
                //        Console.WriteLine($"Email sent successfully to: {userDetails.UserEMailID}");
                //    }
                //    else
                //    {
                //        Console.WriteLine($"Email sending failed: {emailResult.Message}");
                //    }
                //}

                // Check if at least one communication method succeeded
                if (!smsSuccess)  //&& !emailSuccess
                {
                    return StatusCode(500, new
                    {
                        success = false,
                        message = "Failed to send login credentials via SMS and Email."
                    });
                }

                // Prepare response
                return Ok(new
                {
                    success = true,
                    message = "Message sent successfully.",
                    //data = new
                    //{
                    //    userId = userDetails.UserID,
                    //    userLoginId = userDetails.UserLoginID,
                    //    userType = userDetails.UserType,
                    //    mobileNo = MaskMobileNumber(userDetails.UserMobileNo),
                    //    email = MaskEmail(userDetails.UserEMailID),
                    //    smsSent = smsSuccess,
                    //    emailSent = emailSuccess,
                    //    sentAt = DateTime.Now
                    //}
                });
            }
            catch (Exception ex)
            {
                // Log the exception
                Console.WriteLine($"Error sending login credentials: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    success = false,
                    message = "An error occurred while sending login credentials."
                });
            }
        }

        // Helper method to extract first name
        private string GetFirstName(string fullName)
        {
            if (string.IsNullOrEmpty(fullName))
                return "";

            var names = fullName.Trim().Split(' ');
            return names[0];
        }

        // Helper method to mask mobile number for security
        private string MaskMobileNumber(string mobileNo)
        {
            if (string.IsNullOrEmpty(mobileNo) || mobileNo.Length < 4)
                return mobileNo;

            return $"******{mobileNo.Substring(mobileNo.Length - 4)}";
        }

        // Helper method to mask email for security
        private string MaskEmail(string email)
        {
            if (string.IsNullOrEmpty(email) || !email.Contains("@"))
                return email;

            var parts = email.Split('@');
            if (parts[0].Length <= 2)
                return email;

            return $"{parts[0].Substring(0, 2)}****@{parts[1]}";
        }

        // Request model
        public class SendLoginCredentialsRequest
        {
            public string UserLoginID { get; set; }
            public string Name { get; set; }
            public long UserID { get; set; }
            public string mobileNo { get; set; }
            public string Purpose { get; set; }
            public string MessageType { get; set; }
        }
        [AllowAnonymous]
        [HttpPost("verify-mobile-otp")]
        public async Task<IActionResult> VerifyMobileOTP([FromBody] VerifyMobileOTPRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.MobileNo) || string.IsNullOrEmpty(request.OTP))
                {
                    return BadRequest(new { success = false, message = "Mobile number and OTP are required." });
                }

                var cacheKey = $"otp_mobile_{request.MobileNo}";
                if (!_cache.TryGetValue(cacheKey, out OTPData otpData))
                {
                    return BadRequest(new { success = false, message = "OTP expired or not found. Please request a new OTP." });
                }
                _baseWorker.SaveOTPVerificationStatus(request.MobileNo, "VerifyCandidateMobileNo", request.OTP, true);
                // Check if OTP is expired (5 minutes)
                if (DateTime.Now.Subtract(otpData.GeneratedAt).TotalMinutes > 5)
                {
                    _cache.Remove(cacheKey);
                    return BadRequest(new { success = false, message = "OTP has expired. Please request a new OTP." });
                }

                // Check attempts
                if (otpData.Attempts >= 3)
                {
                    _cache.Remove(cacheKey);
                    return BadRequest(new { success = false, message = "Maximum verification attempts exceeded. Please request a new OTP." });
                }

                // Verify OTP using secure comparison
                if (!VerifyOTP(request.OTP, otpData.OTP))
                {
                    otpData.Attempts++;
                    _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid OTP. {3 - otpData.Attempts} attempts remaining.",
                        attemptsRemaining = 3 - otpData.Attempts
                    });
                }

                // Mark as verified
                otpData.IsVerified = true;
                otpData.VerifiedAt = DateTime.Now;
                _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(30));

                return Ok(new
                {
                    success = true,
                    message = "Mobile number verified successfully.",
                    isVerified = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while verifying OTP." });
            }
        }

        [HttpPost("send-email-otp")]
        public async Task<IActionResult> SendEmailOTP([FromBody] SendEmailOTPRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.EmailID) || !IsValidEmail(request.EmailID))
                {
                    return BadRequest(new { success = false, message = "Invalid Email ID." });
                }

                // Get Email configuration
                var dtEMailSMS = _baseWorker.GetEMailSMS("VerifyCandidateEMailID", "E");
                if (dtEMailSMS?.Rows.Count == 0)
                {
                    return BadRequest(new { success = false, message = "Email configuration not found." });
                }

                // Generate secure OTP
                var otp = GenerateSecureOTP(4);
                var messageTemplate = dtEMailSMS.Rows[0]["Message"].ToString();
                var message = messageTemplate.Replace("##OTP##", otp);
                var subject = dtEMailSMS.Rows[0]["Subject"].ToString();
                var purpose = dtEMailSMS.Rows[0]["Purpose"].ToString();

                // Hash the OTP for secure storage
                var hashedOtp = HashOTP(otp);

                // Store hashed OTP in cache
                var cacheKey = $"otp_email_{request.EmailID}";
                var otpData = new OTPData
                {
                    OTP = hashedOtp,
                    GeneratedAt = DateTime.Now,
                    Attempts = 0,
                    IsVerified = false
                };

                _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

                // Send Email
                var emailResult = await SendEmail(request.EmailID, subject, message, purpose);

                if (emailResult.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "OTP sent successfully to your email address.",
                        expiresIn = 300,
                        // For debugging only - remove in production
                        debug = new
                        {
                            otpGenerated = otp,
                            messageContent = message,
                            templateUsed = messageTemplate
                        }
                    });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Failed to send OTP. Please try again." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while sending email OTP." });
            }
        }

        [HttpPost("verify-email-otp")]
        public async Task<IActionResult> VerifyEmailOTP([FromBody] VerifyEmailOTPRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.EmailID) || string.IsNullOrEmpty(request.OTP))
                {
                    return BadRequest(new { success = false, message = "Email ID and OTP are required." });
                }

                var cacheKey = $"otp_email_{request.EmailID}";
                if (!_cache.TryGetValue(cacheKey, out OTPData otpData))
                {
                    return BadRequest(new { success = false, message = "OTP expired or not found. Please request a new OTP." });
                }

                // Check if OTP is expired
                if (DateTime.Now.Subtract(otpData.GeneratedAt).TotalMinutes > 5)
                {
                    _cache.Remove(cacheKey);
                    return BadRequest(new { success = false, message = "OTP has expired. Please request a new OTP." });
                }

                // Check attempts
                if (otpData.Attempts >= 3)
                {
                    _cache.Remove(cacheKey);
                    return BadRequest(new { success = false, message = "Maximum verification attempts exceeded. Please request a new OTP." });
                }

                // Verify OTP using secure comparison
                if (!VerifyOTP(request.OTP, otpData.OTP))
                {
                    otpData.Attempts++;
                    _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));

                    return BadRequest(new
                    {
                        success = false,
                        message = $"Invalid OTP. {3 - otpData.Attempts} attempts remaining.",
                        attemptsRemaining = 3 - otpData.Attempts
                    });
                }

                // Mark as verified
                otpData.IsVerified = true;
                otpData.VerifiedAt = DateTime.Now;
                _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(30));

                return Ok(new
                {
                    success = true,
                    message = "Email verified successfully.",
                    isVerified = true
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while verifying email OTP." });
            }
        }

        // Security Enhancement Methods
        private string GenerateSecureOTP(int length)
        {
            using (var rng = RandomNumberGenerator.Create())
            {
                var bytes = new byte[length];
                rng.GetBytes(bytes);

                var otp = new StringBuilder();
                for (int i = 0; i < length; i++)
                {
                    otp.Append((bytes[i] % 10).ToString());
                }

                return otp.ToString();
            }
        }

        private string HashOTP(string otp)
        {
            using (var sha256 = SHA256.Create())
            {
                var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(otp));
                return Convert.ToBase64String(hashedBytes);
            }
        }

        private bool VerifyOTP(string inputOtp, string hashedOtp)
        {
            var inputHash = HashOTP(inputOtp);
            return inputHash == hashedOtp;
        }

        private async Task<SMSResult> SendSMS(string mobileNo, string templateID, string message, string purpose)
        {
            try
            {
                // Properly encode all parameters
                var encodedMessage = Uri.EscapeDataString(message);
                var encodedMobileNo = Uri.EscapeDataString(mobileNo);
                var encodedTemplateID = Uri.EscapeDataString(templateID);

                // Complete SMS URL - replace with your actual SMS gateway URL
                var url = $"https://api.smartping.ai/fe/api/v1/send?" +
                                        $"username=mahgovmpg.trans&" +
                                        $"password=Qb4GI&" +
                                        $"unicode=true&" +
                                        $"from=MBSVET&" +
                                        $"to={encodedMobileNo}&" +
                                        $"dltPrincipalEntityId=1301167240177654337&" +
                                        $"dltContentId={encodedTemplateID}&" +
                                        $"text={encodedMessage}";


                var client = _httpClientFactory.CreateClient();
                client.Timeout = TimeSpan.FromSeconds(30);

                var response = await client.GetAsync(url);
                var responseBody = await response.Content.ReadAsStringAsync();

                // Log the message
                var messagingEntity = new MessagingEntity
                {
                    MessageType = "S",
                    Purpose = purpose,
                    MessageSubject = "",
                    MessageText = message,
                    EMailID = responseBody,
                    MobileNo = mobileNo,
                    SentBy = "",
                    IPAddress = GetClientIPAddress()
                };

                _baseWorker.SaveMessageContent(messagingEntity);

                return new SMSResult { Success = response.IsSuccessStatusCode, Message = responseBody };
            }
            catch (Exception ex)
            {
                // Log error
                var messagingEntity = new MessagingEntity
                {
                    MessageType = "S",
                    Purpose = purpose,
                    MessageSubject = "",
                    MessageText = message,
                    EMailID = ex.Message,
                    MobileNo = mobileNo,
                    SentBy = "",
                    IPAddress = GetClientIPAddress()
                };

                _baseWorker.SaveMessageContent(messagingEntity);

                return new SMSResult { Success = false, Message = ex.Message };
            }
        }

        private async Task<EmailResult> SendEmail(string emailID, string subject, string message, string purpose)
        {
            try
            {
                // Implement your email sending logic here
                // For now, returning success for testing
                return new EmailResult { Success = true, Message = "Email sent successfully" };
            }
            catch (Exception ex)
            {
                return new EmailResult { Success = false, Message = ex.Message };
            }
        }

        [HttpPost("resend-mobile-otp")]
        public async Task<IActionResult> ResendMobileOTP([FromBody] ResendMobileOTPRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.MobileNo) || request.MobileNo.Length != 10)
                {
                    return BadRequest(new { success = false, message = "Invalid Mobile Number." });
                }

                var cacheKey = $"otp_mobile_{request.MobileNo}";
                var resendCacheKey = $"resend_mobile_{request.MobileNo}";

                // Check resend limit (max 3 resends per hour)
                if (_cache.TryGetValue(resendCacheKey, out int resendCount))
                {
                    if (resendCount >= 3)
                    {
                        return BadRequest(new { success = false, message = "Maximum resend limit reached. Please try again after 1 hour." });
                    }
                }

                // Get SMS configuration
                var dtEMailSMS = _baseWorker.GetEMailSMS("VerifyCandidateMobileNo", "S");
                if (dtEMailSMS?.Rows.Count == 0)
                {
                    return BadRequest(new { success = false, message = "SMS configuration not found." });
                }

                // Generate new secure OTP
                var otp = _baseWorker.GetOTP(request.MobileNo, "VerifyCandidateMobileNo", GenerateSecureOTP(4)); 
                var messageTemplate = dtEMailSMS.Rows[0]["Message"].ToString();
                var message = messageTemplate.Replace("##OTP##", otp);
                var templateID = dtEMailSMS.Rows[0]["TemplateID"].ToString();
                var purpose = dtEMailSMS.Rows[0]["Purpose"].ToString();

                // Hash the OTP for secure storage
                var hashedOtp = HashOTP(otp);

                // Update OTP in cache
                var otpData = new OTPData
                {
                    OTP = hashedOtp,
                    GeneratedAt = DateTime.Now,
                    Attempts = 0,
                    IsVerified = false
                };
                _cache.Remove(cacheKey);
                _cache.Set(cacheKey, otpData, TimeSpan.FromMinutes(5));
                _cache.Remove(resendCacheKey);
                // Update resend count
                _cache.Set(resendCacheKey, resendCount + 1, TimeSpan.FromHours(1));

                // Send SMS
                var smsResult = await SendSMS(request.MobileNo, templateID, message, purpose);

                if (smsResult.Success)
                {
                    return Ok(new
                    {
                        success = true,
                        message = "OTP resent successfully to your mobile number.",
                        expiresIn = 300,
                        resendCount = resendCount + 1,
                        maxResends = 3,
                        // For debugging only - remove in production
                        debug = new
                        {
                            otpGenerated = otp,
                            messageContent = message,
                            templateUsed = messageTemplate
                        }
                    });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "Failed to resend OTP. Please try again." });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while resending OTP." });
            }
        }

        [HttpGet("check-verification-status")]
        public async Task<IActionResult> CheckVerificationStatus([FromQuery] string mobileNo, [FromQuery] string emailID)
        {
            try
            {
                var result = new
                {
                    mobileVerified = false,
                    emailVerified = false
                };

                if (!string.IsNullOrEmpty(mobileNo))
                {
                    var mobileCacheKey = $"otp_mobile_{mobileNo}";
                    if (_cache.TryGetValue(mobileCacheKey, out OTPData mobileOtpData))
                    {
                        result = new
                        {
                            mobileVerified = mobileOtpData.IsVerified,
                            result.emailVerified
                        };
                    }
                }

                if (!string.IsNullOrEmpty(emailID))
                {
                    var emailCacheKey = $"otp_email_{emailID}";
                    if (_cache.TryGetValue(emailCacheKey, out OTPData emailOtpData))
                    {
                        result = new
                        {
                            result.mobileVerified,
                            emailVerified = emailOtpData.IsVerified
                        };
                    }
                }

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while checking verification status." });
            }
        }
        [HttpPost("check-mobile-duplicate")]
        public async Task<IActionResult> CheckMobileDuplicate([FromBody] CheckMobileRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.MobileNo) || request.MobileNo.Length != 10)
                {
                    return BadRequest(new { success = false, message = "Invalid Mobile Number." });
                }

                var dt = _registrationWorker.Registration_IsMobileNoDuplicate(request.MobileNo);

                if (dt.Rows.Count > 0 && !string.IsNullOrEmpty(dt.Rows[0]["CandidateName"].ToString()))
                {
                    return Ok(new
                    {
                        success = false,
                        isDuplicate = true,
                        message = $"Primary Mobile Number already registered for Profile ID: {dt.Rows[0]["ApplicationID"]} Name: {dt.Rows[0]["CandidateName"]}. Enter Other Primary Mobile Number."
                    });
                }

                return Ok(new { success = true, isDuplicate = false, message = "Mobile number is available." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "An error occurred while checking mobile number." });
            }
        }

        private bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }

        private string GetClientIPAddress()
        {
            return HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }

    // Request/Response Models remain the same...
    public class CheckMobileRequest
    {
        public string MobileNo { get; set; }
    }

    public class SendMobileOTPRequest
    {
        public string MobileNo { get; set; }
    }

    public class VerifyMobileOTPRequest
    {
        public string MobileNo { get; set; }
        public string OTP { get; set; }
    }

    public class SendEmailOTPRequest
    {
        public string EmailID { get; set; }
    }

    public class VerifyEmailOTPRequest
    {
        public string EmailID { get; set; }
        public string OTP { get; set; }
    }

    public class ResendMobileOTPRequest
    {
        public string MobileNo { get; set; }
    }

    public class OTPData
    {
        public string OTP { get; set; }
        public DateTime GeneratedAt { get; set; }
        public int Attempts { get; set; }
        public bool IsVerified { get; set; }
        public DateTime? VerifiedAt { get; set; }
    }

    public class SMSResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class EmailResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}