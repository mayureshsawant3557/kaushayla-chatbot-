using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Portal.Business.Interface.Base;
using System;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;

namespace Portal.Business.Worker.Base
{
    public class OcrVerificationServiceWorker : IOcrVerificationService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly ILogger<OcrVerificationServiceWorker> _logger;

        public OcrVerificationServiceWorker(HttpClient httpClient, IConfiguration configuration, ILogger<OcrVerificationServiceWorker> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration;
            
            var baseUrl = configuration["OcrVerificationServiceUrl"] ?? "http://localhost:8000";
            httpClient.BaseAddress = new Uri(baseUrl);
            _httpClient = httpClient;
        }

        public async Task<bool> VerifyDocumentAsync(string fileUrl, string documentType, string expectedNumber)
        {
            var result = await VerifyDocumentDetailedAsync(fileUrl, documentType, expectedNumber);
            return result.Verified;
        }

        public async Task<OcrVerificationResult> VerifyDocumentDetailedAsync(string fileUrl, string documentType, string expectedNumber)
        {
            if (string.IsNullOrWhiteSpace(fileUrl) || string.IsNullOrWhiteSpace(expectedNumber))
            {
                _logger.LogWarning("VerifyDocumentDetailedAsync called with empty fileUrl or expectedNumber.");
                return new OcrVerificationResult
                {
                    Success = false,
                    Verified = false,
                    Message = "Document file path and expected number are required."
                };
            }

            try
            {
                _logger.LogInformation($"Retrieving document for OCR: fileUrl={fileUrl}, Type={documentType}, Expected={expectedNumber}");

                byte[] fileBytes = null;
                string fileName = "document.pdf";

                // 1. Try reading from local file system if path exists
                if (File.Exists(fileUrl))
                {
                    fileBytes = await File.ReadAllBytesAsync(fileUrl);
                    fileName = Path.GetFileName(fileUrl);
                }

                // 2. Try downloading from Azure Blob Storage using configured credentials
                if (fileBytes == null)
                {
                    var connectionString = _configuration["Blob:StorageConnectionString"];
                    var containerName = _configuration["Blob:FileMainContainer"]?.ToLower() ?? "dvettesting";

                    if (!string.IsNullOrEmpty(connectionString))
                    {
                        try
                        {
                            string blobName = fileUrl;
                            if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
                            {
                                var segments = uri.AbsolutePath.TrimStart('/').Split('/', 2);
                                if (segments.Length == 2 && segments[0].Equals(containerName, StringComparison.OrdinalIgnoreCase))
                                {
                                    blobName = Uri.UnescapeDataString(segments[1]);
                                }
                                else
                                {
                                    blobName = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/'));
                                }
                            }

                            var blobServiceClient = new BlobServiceClient(connectionString);
                            var containerClient = blobServiceClient.GetBlobContainerClient(containerName);
                            var blobClient = containerClient.GetBlobClient(blobName);

                            if (await blobClient.ExistsAsync())
                            {
                                using var ms = new MemoryStream();
                                await blobClient.DownloadToAsync(ms);
                                fileBytes = ms.ToArray();
                                fileName = Path.GetFileName(blobName);
                            }
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, $"Failed to download blob via Azure SDK for: {fileUrl}");
                        }
                    }
                }

                // 3. Try direct HTTP download (if accessible via public/SAS URL)
                if (fileBytes == null && fileUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                {
                    try
                    {
                        using var downloadClient = new HttpClient();
                        fileBytes = await downloadClient.GetByteArrayAsync(fileUrl);
                        if (Uri.TryCreate(fileUrl, UriKind.Absolute, out var uri))
                        {
                            fileName = Path.GetFileName(uri.AbsolutePath);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, $"Failed to download file via HTTP: {fileUrl}");
                    }
                }

                if (fileBytes == null || fileBytes.Length == 0)
                {
                    _logger.LogWarning($"Unable to retrieve document bytes for verification from '{fileUrl}'.");
                    return new OcrVerificationResult
                    {
                        Success = false,
                        Verified = false,
                        Message = "Unable to retrieve document from storage for verification."
                    };
                }

                using var formData = new MultipartFormDataContent();
                using var fileContent = new ByteArrayContent(fileBytes);
                fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/pdf");
                formData.Add(fileContent, "file", string.IsNullOrWhiteSpace(fileName) ? "document.pdf" : fileName);
                formData.Add(new StringContent(documentType ?? ""), "document_type");
                formData.Add(new StringContent(expectedNumber ?? ""), "expected_number");

                var response = await _httpClient.PostAsync("/api/document/verify", formData);

                if (response == null || !response.IsSuccessStatusCode)
                {
                    var statusCode = response != null ? (int)response.StatusCode : 0;
                    _logger.LogWarning($"OCR Service returned HTTP {statusCode}: {response?.ReasonPhrase}");
                    return new OcrVerificationResult
                    {
                        Success = false,
                        Verified = false,
                        Message = $"OCR service error: {response?.ReasonPhrase} (HTTP {statusCode})"
                    };
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"OCR Service Response: {responseContent}");

                using var jsonDoc = JsonDocument.Parse(responseContent);
                var root = jsonDoc.RootElement;

                bool success = root.TryGetProperty("success", out var sProp) ? sProp.GetBoolean() : true;
                bool verified = false;
                if (root.TryGetProperty("verified", out var verifiedProp))
                {
                    verified = verifiedProp.GetBoolean();
                }
                else if (root.TryGetProperty("match", out var matchProperty))
                {
                    verified = matchProperty.GetBoolean();
                }

                string responseMsg = root.TryGetProperty("message", out var msgProp) ? msgProp.GetString() : string.Empty;

                if (!success)
                {
                    return new OcrVerificationResult
                    {
                        Success = false,
                        Verified = false,
                        Message = string.IsNullOrWhiteSpace(responseMsg) ? "Unable to extract required document number" : responseMsg
                    };
                }

                return new OcrVerificationResult
                {
                    Success = true,
                    Verified = verified,
                    Message = verified ? "VERIFIED" : "NOT VERIFIED — Document number does not match"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while calling the OCR verification service.");
                return new OcrVerificationResult
                {
                    Success = false,
                    Verified = false,
                    Message = $"OCR processing error: {ex.Message}"
                };
            }
        }
    }
}
