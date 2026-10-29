using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Portal.Server.Controllers.Base
{
    /// <summary>
    /// Gateway proxy controller integrating Kaushalya AI Chatbot & Somya TTS microservices into the main MSBSVET application.
    /// </summary>
    [ApiController]
    [AllowAnonymous]
    public class ChatbotController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly string _chatbotServiceUrl;
        private readonly ILogger<ChatbotController> _logger;

        public ChatbotController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<ChatbotController> logger)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _chatbotServiceUrl = (configuration["ChatbotServiceUrl"] ?? "http://localhost:8005").TrimEnd('/');
            _httpClient = httpClientFactory.CreateClient("ChatbotServiceClient");
            _httpClient.Timeout = TimeSpan.FromSeconds(60);
        }

        [HttpPost("api/chat")]
        [HttpPost("api/chatbot/chat")]
        public async Task<IActionResult> Chat(CancellationToken ct)
        {
            try
            {
                using var reader = new StreamReader(Request.Body, Encoding.UTF8);
                var requestBody = await reader.ReadToEndAsync(ct);

                using var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_chatbotServiceUrl}/api/chat/", content, ct);

                var responseString = await response.Content.ReadAsStringAsync(ct);
                return Content(responseString, "application/json", Encoding.UTF8);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chatbot gateway proxy error in Chat endpoint");
                return StatusCode(503, new { error = "Chatbot service temporarily unavailable", details = ex.Message });
            }
        }

        [HttpPost("api/tts")]
        [HttpPost("api/chatbot/tts")]
        public async Task<IActionResult> Tts(CancellationToken ct)
        {
            try
            {
                using var reader = new StreamReader(Request.Body, Encoding.UTF8);
                var requestBody = await reader.ReadToEndAsync(ct);

                using var content = new StringContent(requestBody, Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_chatbotServiceUrl}/api/tts/", content, ct);

                if (!response.IsSuccessStatusCode)
                {
                    var errStr = await response.Content.ReadAsStringAsync(ct);
                    return StatusCode((int)response.StatusCode, errStr);
                }

                var mediaType = response.Content.Headers.ContentType?.MediaType ?? "audio/wav";
                foreach (var header in response.Headers)
                {
                    if (header.Key.StartsWith("X-TTS", StringComparison.OrdinalIgnoreCase))
                    {
                        Response.Headers[header.Key] = string.Join(",", header.Value);
                    }
                }

                var audioBytes = await response.Content.ReadAsByteArrayAsync(ct);
                return File(audioBytes, mediaType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chatbot gateway proxy error in TTS endpoint");
                return StatusCode(503, new { error = "TTS voice service temporarily unavailable", details = ex.Message });
            }
        }

        [HttpGet("api/chatbot/health")]
        [HttpGet("api/chat/health")]
        public async Task<IActionResult> Health(CancellationToken ct)
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_chatbotServiceUrl}/api/health", ct);
                var responseString = await response.Content.ReadAsStringAsync(ct);
                return Content(responseString, "application/json", Encoding.UTF8);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Chatbot health check failed");
                return StatusCode(503, new { status = "error", message = "Chatbot microservice unreachable", details = ex.Message });
            }
        }
    }
}
