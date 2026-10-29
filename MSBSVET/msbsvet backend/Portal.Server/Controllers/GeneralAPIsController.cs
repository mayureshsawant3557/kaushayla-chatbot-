using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Portal.Business.Interface.ITIAdmission;
using Portal.Entities.ResponseBody;
using System.Collections.Generic;
using System.Data;
using Twilio.TwiML.Voice;


namespace Portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [AllowAnonymous]
    public class GeneralAPIsController : ControllerBase
    {
        private readonly string _connectionString;
        private readonly IITIAdmission _iitiAdmission;
        public GeneralAPIsController(IConfiguration configuration, IITIAdmission iitiAdmission)
        {
            _connectionString = configuration.GetConnectionString("DBConnection") ?? throw new ArgumentNullException(nameof(configuration));
            _iitiAdmission = iitiAdmission ?? throw new ArgumentNullException(nameof(iitiAdmission));
        }


        [HttpGet("genders")]
        public IActionResult GetGenders()
        {
            List<object> genders = new List<object>();


            try
            {
                using (SqlConnection con = new SqlConnection(_connectionString))
                {
                    string query = "SELECT GenderCode, Gender FROM Master_Gender WHERE IsActive = 1";
                    SqlCommand cmd = new SqlCommand(query, con);

                    con.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        genders.Add(new
                        {
                            GenderCode = reader["GenderCode"].ToString(),
                            Gender = reader["Gender"].ToString()
                        });
                    }

                    reader.Close();
                }

                return Ok(genders);
            }
            catch (SqlException ex)
            {
                return StatusCode(500, $"Database error: {ex.Message}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("blood-groups")]
        public IActionResult GetBloodGroups()
        {
            var bloodGroups = new List<object>();

            try
            {   
                using (SqlConnection con = new SqlConnection(_connectionString))
                {
                    string query = "SELECT BloodGroupID, BloodGroup FROM Master_BloodGroup WHERE IsActive = 1";
                    SqlCommand cmd = new SqlCommand(query, con);

                    con.Open();
                    SqlDataReader reader = cmd.ExecuteReader();

                    while (reader.Read())
                    {
                        bloodGroups.Add(new
                        {
                            BloodGroupID = reader["BloodGroupID"].ToString(),
                            BloodGroup = reader["BloodGroup"].ToString()
                        });
                    }

                    reader.Close();
                }

                var response = ApiResponse<object>.SuccessResponse(bloodGroups, "Blood groups fetched successfully");
                return Ok(response);
            }
            catch (SqlException ex)
            {
                var errorResponse = ApiResponse<string>.ErrorResponse($"Database error: {ex.Message}", 500);
                return StatusCode(500, errorResponse);
            }
            catch (Exception ex)
            {
                var errorResponse = ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500);
                return StatusCode(500, errorResponse);
            }
        }



        //[HttpGet("device/ip")]
        //public async Task<IActionResult> GetDeviceIp()
        //{
        //    using var client = new HttpClient();
        //    var json = await client.GetStringAsync("https://api.ipify.org?format=json");
        //    return Content(json, "application/json");
        //}

        [HttpGet("device/ip")]
        public IActionResult GetDeviceIp()
        {
            var ipAddress = GetClientIpAddress();

            return Ok(new
            {
                ip = ipAddress
            });
        }

        private string GetClientIpAddress()
        {
            // 1. Cloudflare
            var cfIp = Request.Headers["CF-Connecting-IP"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(cfIp) &&
                TryExtractCleanIp(cfIp, out var parsedCf))
            {
                return parsedCf;
            }

            // 2. X-Forwarded-For
            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(forwardedFor))
            {
                var firstIp = forwardedFor.Split(',')[0].Trim();

                if (TryExtractCleanIp(firstIp, out var parsedForwarded))
                {
                    return parsedForwarded;
                }
            }

            // 3. X-Real-IP
            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();

            if (!string.IsNullOrWhiteSpace(realIp) &&
                TryExtractCleanIp(realIp, out var parsedReal))
            {
                return parsedReal;
            }

            // 4. Remote IP
            var remoteIp = HttpContext.Connection.RemoteIpAddress;

            if (remoteIp != null)
            {
                if (remoteIp.IsIPv4MappedToIPv6)
                    remoteIp = remoteIp.MapToIPv4();

                var ipString = remoteIp.ToString();

                if (ipString == "::1")
                    return "127.0.0.1";

                return ipString;
            }

            return "127.0.0.1";
        }

        private static bool TryExtractCleanIp(string rawIp, out string cleanIp)
        {
            cleanIp = string.Empty;

            if (string.IsNullOrWhiteSpace(rawIp))
                return false;

            rawIp = rawIp.Trim();

            // IPv6 with port: [2001:db8::1]:50443
            if (rawIp.StartsWith("[") && rawIp.Contains("]"))
            {
                var closeIndex = rawIp.IndexOf(']');
                var ipv6 = rawIp.Substring(1, closeIndex - 1);

                if (System.Net.IPAddress.TryParse(ipv6, out var parsedIpv6))
                {
                    cleanIp = parsedIpv6.ToString();
                    return true;
                }
            }

            // IPv4 with port: 103.21.244.2:51234
            if (rawIp.Contains(':') &&
                rawIp.IndexOf(':') == rawIp.LastIndexOf(':'))
            {
                var parts = rawIp.Split(':');

                if (System.Net.IPAddress.TryParse(parts[0], out var parsedIpv4))
                {
                    cleanIp = parsedIpv4.ToString();
                    return true;
                }
            }

            // Normal IPv4 / IPv6
            if (System.Net.IPAddress.TryParse(rawIp, out var parsed))
            {
                if (parsed.IsIPv4MappedToIPv6)
                    parsed = parsed.MapToIPv4();

                cleanIp = parsed.ToString();

                if (cleanIp == "::1")
                    cleanIp = "127.0.0.1";

                return true;
            }

            return false;
        }



        [HttpGet("GetIITIAdmissionData")]
        public IActionResult GetIITIAdmissionData([FromQuery] string ITIRegistrationNo, [FromQuery] string ITIFirstName, [FromQuery] string ITIDOBITI)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ITIRegistrationNo))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI Registration Number is required."));

                if (string.IsNullOrWhiteSpace(ITIFirstName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI First Name is required."));

                if (string.IsNullOrWhiteSpace(ITIDOBITI))
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI Date of Birth is required."));

                var data = _iitiAdmission.GetIITIAdmissionData(ITIRegistrationNo, ITIFirstName, ITIDOBITI);
                return Ok(ApiResponse<object>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, StatusCodes.Status500InternalServerError));
            }
        }

        [HttpGet("GetMSBSVETCandidateData")]
        public IActionResult GetMSBVAdmissionData([FromQuery] string ApplicationID, [FromQuery] string FirstName, [FromQuery] string DOB)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ApplicationID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET Registration Number is required."));

                if (string.IsNullOrWhiteSpace(FirstName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET First Name is required."));

                if (string.IsNullOrWhiteSpace(DOB))
                    return BadRequest(ApiResponse<string>.ErrorResponse("MSBSVET Date of Birth is required."));

                var data = _iitiAdmission.GetMSBVAdmissionData(ApplicationID, FirstName, DOB);
                return Ok(ApiResponse<object>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(ex.Message, StatusCodes.Status500InternalServerError));
            }
        }
    }

    
    }

public class Language
{
    public int LanguageID { get; set; }
    public string LanguageName { get; set; }
}
