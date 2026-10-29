using Microsoft.Extensions.Options;
using Portal.Business.Interface.Base;
using Portal.Data;
using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Enum;
using QuestPDF.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Net.WebRequestMethods;

namespace Portal.Business.Worker
{
    public class AadhaarVerificationService :IAadhaarVerificationService
    {
        private readonly HttpClient _http;
        private readonly AadhaarApiOptions _opts;
        private readonly ISecurityService _securityService;
        private readonly ITimeZoneService _timeZoneService;
        private readonly Repository _repository;

        public AadhaarVerificationService(HttpClient http, IOptions<AadhaarApiOptions> opts, ISecurityService securityService, ITimeZoneService timeZoneService, Repository repository)
        {
            _http = http;
            _opts = opts.Value;
            _securityService = securityService;
            _timeZoneService = timeZoneService;
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
        }
        public async Task<AadhaarVerifyResponse> VerifyAsync(AadhaarVerifyRequest request, CancellationToken ct = default)
        {
            var result = new AadhaarVerifyResponse { IsVerified = false };

            try
            {
                DateTime dob = _timeZoneService.ConvertDateStringToDateTime(request.Dob)!.Value;
                GenderCode gender = Enum.Parse<GenderCode>(request.Gender);

                // 1. Build payload with server-side credentials
                var payload = new
                {
                    first_name = request.FirstName,
                    father_name = request.FatherName,
                    last_name = request.LastName,
                    dobday = dob.ToString("dd"),
                    dobmonth = dob.ToString("MM"),
                    dobyear = dob.ToString("yyyy"),
                    gender = ((int)gender).ToString(),
                    aadhar_no = request.AadhaarNo,
                    is_fathers_name = request.FatherName.Length > 0 ? "1" : "0",
                    mobile = string.Empty,
                    isOnlyYear = "Yes",
                    apiAuthData = new AadhaarAuthData
                    {
                        username = _opts.Username,
                        password = _opts.Password,
                        access_token = _opts.AccessToken,
                        user = _opts.User
                    }
                };

                // 2. Post Api request with timeout
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(_opts.TimeoutMs);

                using var httpResponse = await _http.PostAsJsonAsync(_opts.BaseUrl, payload, cts.Token);

                string responseJson = await httpResponse.Content.ReadAsStringAsync(cts.Token);

                if (!httpResponse.IsSuccessStatusCode)
                {
                    result.Message = $"API returned HTTP {(int)httpResponse.StatusCode}: "
                                   + responseJson[..Math.Min(200, responseJson.Length)];
                    return result;
                }

                // 3. Parse response
                var apiResp = JsonSerializer.Deserialize<AadhaarApiResponse>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (apiResp is null)
                {
                    result.Message = "Failed to parse API response.";
                    return result;
                }

                bool isVerified = string.Equals(apiResp.Ret?.Trim(), "y", StringComparison.OrdinalIgnoreCase);

                result.IsVerified = isVerified;
                result.RawRet = apiResp.Ret;
                result.ReferenceNo = apiResp.refNum ?? "N/A";
                result.SubAUAtransId = apiResp.SubAUAtransId;
                result.ResponseTs = apiResp.ResponseTs;
                result.ResponseMsg = apiResp.ResponseMsg;
                result.RawResponse = responseJson.Length > 500 ? responseJson[..500] : responseJson;
                result.Message = isVerified ? "Aadhaar identity verified successfully." : $"Aadhaar details do not match. Please check and retry.";

                // 4. Populate demographics on success
                if (isVerified)
                {
                    result.Data = new AadhaarDemographics
                    {
                        FirstName = request.FirstName,
                        MiddleName = request.FatherName,
                        LastName = request.LastName,
                        DOB = request.Dob,
                        Gender = request.Gender
                    };
                }

                LogAadhaarVerificationRequest request1 = new LogAadhaarVerificationRequest();

                request1.CandidateId = request.CandidateId;
                request1.FirstName = request.FirstName;
                request1.FatherName = request.FatherName;
                request1.LastName = request.LastName;
                request1.Dob = request.Dob;
                request1.Gender = request.Gender;
                request1.AadhaarNo = request.AadhaarNo;
                request1.IsVerified = isVerified;
                request1.RawRet = apiResp.Ret;
                request1.ReferenceNo = apiResp.refNum ?? "N/A";
                request1.SubAUAtransId = apiResp.SubAUAtransId;
                request1.ResponseTs = apiResp.ResponseTs;
                request1.ResponseMsg = apiResp.ResponseMsg;
                request1.RawResponse = responseJson;
                request1.UserLoginId = request.UserLoginId;
                request1.IpAddress = _securityService.GetClientIpAddress() ?? "";

                await _repository.SaveAadhaarVerificationDetailsAsync(request1);
            }
            catch (TaskCanceledException)
            {
                result.Message = "The request to the Aadhaar API timed out. Please try again.";
            }
            catch (HttpRequestException httpEx)
            {
                result.Message = $"API Error: {httpEx.Message}";
            }
            catch (Exception ex)
            {
                result.Message = $"Server Error: {ex.Message}";
            }

            return result;
        }
        public async Task<AadhaarReVerifyResponse> ReVerifyAsync(AadhaarReVerifyRequest request, CancellationToken ct = default)
        {
            var result = new AadhaarReVerifyResponse { IsReVerified = false };

            try
            {
                DateTime dob = _timeZoneService.ConvertDateStringToDateTime(request.Dob)!.Value;
                GenderCode gender = Enum.Parse<GenderCode>(request.Gender);

                // 1. Build payload with server-side credentials
                var payload = new
                {
                    first_name = request.FirstName,
                    father_name = request.FatherName,
                    last_name = request.LastName,
                    dobday = dob.ToString("dd"),
                    dobmonth = dob.ToString("MM"),
                    dobyear = dob.ToString("yyyy"),
                    gender = ((int)gender).ToString(),
                    aadhar_no = request.AadhaarNo,
                    is_fathers_name = request.FatherName.Length > 0 ? "1" : "0",
                    mobile = string.Empty,
                    isOnlyYear = "Yes",
                    apiAuthData = new AadhaarAuthData
                    {
                        username = _opts.Username,
                        password = _opts.Password,
                        access_token = _opts.AccessToken,
                        user = _opts.User
                    }
                };

                // 2. Post Api request with timeout
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(_opts.TimeoutMs);

                using var httpResponse = await _http.PostAsJsonAsync(_opts.BaseUrl, payload, cts.Token);

                string responseJson = await httpResponse.Content.ReadAsStringAsync(cts.Token);

                if (!httpResponse.IsSuccessStatusCode)
                {
                    result.Message = $"API returned HTTP {(int)httpResponse.StatusCode}: "
                                   + responseJson[..Math.Min(200, responseJson.Length)];
                    return result;
                }

                // 3. Parse response
                var apiResp = JsonSerializer.Deserialize<AadhaarApiResponse>(responseJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                if (apiResp is null)
                {
                    result.Message = "Failed to parse API response.";
                    return result;
                }

                bool isVerified = string.Equals(apiResp.Ret?.Trim(), "y", StringComparison.OrdinalIgnoreCase);

                result.IsReVerified = isVerified;
                result.RawRet = apiResp.Ret;
                result.ReferenceNo = apiResp.refNum ?? "N/A";
                result.SubAUAtransId = apiResp.SubAUAtransId;
                result.ResponseTs = apiResp.ResponseTs;
                result.ResponseMsg = apiResp.ResponseMsg;
                result.RawResponse = responseJson.Length > 500 ? responseJson[..500] : responseJson;
                result.Message = isVerified ? "Aadhaar identity verified successfully." : $"Aadhaar details do not match. Please check and retry.";

                // 4. Populate demographics on success
                if (isVerified)
                {
                    result.Data = new AadhaarDemographics
                    {
                        FirstName = request.FirstName,
                        MiddleName = request.FatherName,
                        LastName = request.LastName,
                        DOB = request.Dob,
                        Gender = request.Gender
                    };
                }

                LogAadhaarReVerificationRequest request1 = new LogAadhaarReVerificationRequest();

                request1.CandidateId = request.CandidateId;
                request1.FirstName = request.FirstName;
                request1.FatherName = request.FatherName;
                request1.LastName = request.LastName;
                request1.Dob = request.Dob;
                request1.Gender = request.Gender;
                request1.AadhaarNo = request.AadhaarNo;
                request1.IsReVerified = isVerified;
                request1.RawRet = apiResp.Ret;
                request1.ReferenceNo = apiResp.refNum ?? "N/A";
                request1.SubAUAtransId = apiResp.SubAUAtransId;
                request1.ResponseTs = apiResp.ResponseTs;
                request1.ResponseMsg = apiResp.ResponseMsg;
                request1.RawResponse = responseJson;
                request1.UserLoginId = request.UserLoginId;
                request1.IpAddress = _securityService.GetClientIpAddress() ?? "";

                await _repository.SaveAadhaarReVerificationDetailsAsync(request1);
            }
            catch (TaskCanceledException)
            {
                result.Message = "The request to the Aadhaar API timed out. Please try again.";
            }
            catch (HttpRequestException httpEx)
            {
                result.Message = $"API Error: {httpEx.Message}";
            }
            catch (Exception ex)
            {
                result.Message = $"Server Error: {ex.Message}";
            }

            return result;
        }
    }
}
