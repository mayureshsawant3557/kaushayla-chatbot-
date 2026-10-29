using iTextSharp.text.pdf.security;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Internal;
using Microsoft.Exchange.WebServices.Data;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using NPOI.HSSF.Record.Chart;
using NPOI.SS.Formula.Functions;
using Portal.Business.Interface;
using Portal.Business.Interface.Attendance;
using Portal.Entities.AttendanceDbResponse;
using Portal.Entities.Attendence;
using System.Net.Http.Headers;
using System.Text;
using static QRCoder.PayloadGenerator;

namespace Portal.Business.Worker.Attendance
{
    public class PythonServiceWorker : IPythonService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _pythonServiceBaseUrl;

        public PythonServiceWorker(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
            _pythonServiceBaseUrl = _configuration["PythonService:BaseUrl"] ?? "https://your-vercel-app.vercel.app";
        }
        
        
        //{true, Data(Encoding)}   {false, Message}
        public async Task<ServiceResult<string>> GetFaceEncodingFromImageUrl(string ImageUrl)
        {
            if (string.IsNullOrEmpty(ImageUrl))
            {
                return ServiceResult<string>.FailureResponse("Face image URL is required");
            }
            try
            {
                var url = $"{_pythonServiceBaseUrl}/encode-url";

                var requestBody = new { imageUrl = ImageUrl };
                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObj = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                //// Success case
                if (response.IsSuccessStatusCode && responseObj != null &&
                    responseObj.TryGetValue("isEncoded", out var isEncoded) && Convert.ToBoolean(isEncoded) &&
                    responseObj.TryGetValue("encoding", out var encoding))
                {
                    string Encoding = JsonConvert.SerializeObject(encoding);
                    return ServiceResult<string>.SuccessResponse(Encoding);
                }

                //// Failure returned by Python
                return ServiceResult<string>.FailureResponse( responseObj?["error"]?.ToString() ?? "Face encoding failed");
            }
            catch (Exception ex)
            {
                return ServiceResult<string>.FailureResponse(ex.Message);
            }

            //try
            //{
            //    // 🔴 CHANGED: Always return dummy encoding
            //    var dummyEncoding = Enumerable.Repeat(0.1234, 128).ToList();
            //    return ServiceResult<object>.SuccessResponse(dummyEncoding);
            //}
            //catch
            //{
            //    // 🔴 CHANGED: Never throw exception
            //    var dummyEncoding = Enumerable.Repeat(0.1234, 128).ToList();
            //    return ServiceResult<object>.SuccessResponse(dummyEncoding);
            //}
        }


        //{true, Data(Encoding)}   {false, Message}
        public async Task<ServiceResult<string>> GetFaceEncodingFromImage(IFormFile Image)
        {
            if (Image == null || Image.Length == 0)
            {
                return ServiceResult<string>.FailureResponse("Image is required");
            }
            try
            {
                var url = $"{_pythonServiceBaseUrl}/encode-file";

                using var content = new MultipartFormDataContent();
                using var imageContent = new StreamContent(Image.OpenReadStream());
                imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse(Image.ContentType);
                content.Add(imageContent, "image", Image.FileName);
                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObj = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                //// Success case
                if (response.IsSuccessStatusCode && responseObj != null &&
                    responseObj.TryGetValue("isEncoded", out var isEncoded) && Convert.ToBoolean(isEncoded) &&
                    responseObj.TryGetValue("encoding", out var encoding))
                {
                    string Encoding = JsonConvert.SerializeObject(encoding);
                    return ServiceResult<string>.SuccessResponse(Encoding);
                }

                //// Failure returned by Python
                return ServiceResult<string>.FailureResponse(responseObj?["error"]?.ToString() ?? "Face encoding failed");
            }
            catch (Exception ex)
            {
                return ServiceResult<string>.FailureResponse(ex.Message);
            }

            //try
            //{
            //    // 🔴 CHANGED: Always return dummy encoding
            //    var dummyEncoding = Enumerable.Repeat(0.1234, 128).ToList();
            //    return ServiceResult<object>.SuccessResponse(dummyEncoding);
            //}
            //catch
            //{
            //    // 🔴 CHANGED: Never throw exception
            //    var dummyEncoding = Enumerable.Repeat(0.1234, 128).ToList();
            //    return ServiceResult<object>.SuccessResponse(dummyEncoding);
            //}
        }

        //You can also pass matchingTreshold as a parameter to this method and forward it to the Python service for more flexible matching
        //{true}   {false, Message}
        public async Task<ServiceResult<object>> CompareEncodings(string encoding1, string encoding2)
        {
            if (string.IsNullOrEmpty(encoding1) || string.IsNullOrEmpty(encoding2))
            {
                return ServiceResult<object>.SuccessResponse("Face Encoding is required");
            }
            try
            {

                var url = $"{_pythonServiceBaseUrl}/compare";
                // Parse encodings from JSON strings back to arrays
                var enc1List = JsonConvert.DeserializeObject<List<double>>(encoding1);
                var enc2List = JsonConvert.DeserializeObject<List<double>>(encoding2);
                var requestBody = new
                {
                    enc1 = enc1List,
                    enc2 = enc2List,
                    matchThreshold = 0.65 // You can make this configurable
                };
                var json = JsonConvert.SerializeObject(requestBody);
                var content = new StringContent(json, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                var responseObj = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                //// Success case
                if (response.IsSuccessStatusCode &&  responseObj.TryGetValue("isMatch", out var isMatch))
                {
                    if (Convert.ToBoolean(isMatch))
                    {
                        return ServiceResult<object>.SuccessResponse("Face Matched");
                    }

                    // Comparison completed but faces don't match
                    return ServiceResult<object>.FailureResponse("Face Not Matched.",StatusCodes.Status422UnprocessableEntity,"FACE_NOT_MATCHED");
                }

                //// Failure returned by Python
                return ServiceResult<object>.FailureResponse(responseObj?["error"]?.ToString() ?? "Face verification failed.");
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResponse(ex.Message);
            }

            //try
            //{
            //    // 🔴 CHANGED: Always return true
            //    return ServiceResult<object>.SuccessResponse("Face Matched");
            //}
            //catch
            //{
            //    // 🔴 CHANGED: Never throw exception
            //    return ServiceResult<object>.SuccessResponse("Face Matched");   
            //}
        }

        // you can pass blurTreshold as a parameter to this method and forward it to the Python service for more flexible validation of blurry images (now 75)
        //{true}   {false, Message, StatusCode}
        public async Task<ServiceResult<object>> CheckIsHumanFace(IFormFile image)
        {
            try
            {
                var url = $"{_pythonServiceBaseUrl}/check-isHumanFace";
                using var content = new MultipartFormDataContent();
                using var imageContent = new StreamContent(image.OpenReadStream());
                imageContent.Headers.ContentType = MediaTypeHeaderValue.Parse(image.ContentType);
                content.Add(imageContent, "image", image.FileName);

                var response = await _httpClient.PostAsync(url, content);
                var responseContent = await response.Content.ReadAsStringAsync();


                // Ensure response is JSON
                if (string.IsNullOrWhiteSpace(responseContent) || (!responseContent.TrimStart().StartsWith("{") && !responseContent.TrimStart().StartsWith("[")))
                {
                    return ServiceResult<object>.FailureResponse("Invalid response from face service.",StatusCodes.Status503ServiceUnavailable,"FACE_SERVICE_INVALID_RESPONSE");
                }
                var responseObj = JsonConvert.DeserializeObject<Dictionary<string, object>>(responseContent);

                // SUCCESS
                if (response.IsSuccessStatusCode && responseObj.TryGetValue("isVerified", out var verified) && Convert.ToBoolean(verified))
                {
                    return ServiceResult<object>.SuccessResponse("Human Face Verified");
                }

                // FAILURE MAPPING
                string message = responseObj.TryGetValue("error", out var err) ? err?.ToString() ?? "Face validation failed." : "Face validation failed.";
                string errorCode = "FACE_VALIDATION_FAILED";

                // Face blurry
                if (responseObj.ContainsKey("blurScore"))
                {
                    message = "Face too blur.";
                    errorCode = "FACE_BLURRY";
                }
                // Multiple / No faces
                else if (responseObj.TryGetValue("faceCount", out var faceCountObj))
                {
                    int faceCount = Convert.ToInt32(faceCountObj);

                    if (faceCount == 0)
                    {
                        errorCode = "NO_FACE_FOUND";
                        message = "No human face found.";
                    }
                    else if (faceCount != 1)
                    {
                        errorCode = "NEED_ONE_FACE";
                        message = "Exactly one human face is required.";
                    }
                }
                // Low resolution
                else if (message.Contains("resolution", StringComparison.OrdinalIgnoreCase))
                {
                    errorCode = "LOW_IMAGE_QUALITY";
                }
                // Face too far / small
                else if (message.Contains("too small", StringComparison.OrdinalIgnoreCase) ||
                         message.Contains("too far", StringComparison.OrdinalIgnoreCase))
                {
                    message = "Face too far from camera.";
                    errorCode = "FACE_TOO_FAR";
                }
                // No face
                else if (message.Contains("No human face", StringComparison.OrdinalIgnoreCase))
                {
                    errorCode = "NO_FACE_FOUND";
                }


                return ServiceResult<object>.FailureResponse( message, StatusCodes.Status422UnprocessableEntity , errorCode);
            }
            catch (Exception ex)
            {
                return ServiceResult<object>.FailureResponse(ex.Message);
            }

            //try
            //{
            //    // 🔴 CHANGED: Always return true
            //    return ServiceResult<object>.SuccessResponse("Human Face Verified");
            //}
            //catch
            //{
            //    // 🔴 CHANGED: Never throw exception
            //    return ServiceResult<object>.SuccessResponse("Human Face Verified");   
            //}
        }
    }
}
