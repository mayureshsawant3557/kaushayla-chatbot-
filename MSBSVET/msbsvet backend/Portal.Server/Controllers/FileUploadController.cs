using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Practices.EnterpriseLibrary.Data;
using System;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using System.IO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Logging;


namespace Portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [EnableCors("AllowAll")]
    public class FileUploadController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<FileUploadController> _logger;

        public FileUploadController(IConfiguration configuration, ILogger<FileUploadController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet]
        public IActionResult GenerateBlobSasUrl(string fileName, string dicContainers)
        {
            try
            {
                _logger.LogInformation($"FileUpload request - fileName: {fileName}, dicContainers: {dicContainers}, Origin: {Request.Headers["Origin"]}");

                // Get configuration from dependency injection (already loaded)
                var blobSection = _configuration.GetSection("Blob");
                var _connectionString = blobSection["StorageConnectionString"];
                var _fileMainContainer = blobSection["FileMainContainer"]?.ToLower();

                // Validate configuration
                if (string.IsNullOrEmpty(_connectionString))
                {
                    _logger.LogError("Storage connection string is not configured.");
                    return StatusCode(500, new { error = "Storage connection string is not configured." });
                }

                if (string.IsNullOrEmpty(_fileMainContainer))
                {
                    _logger.LogError("File main container is not configured.");
                    return StatusCode(500, new { error = "File main container is not configured." });
                }

                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_fileMainContainer);
                containerClient.CreateIfNotExists();

                var blobClient = containerClient.GetBlobClient(dicContainers + "/" + fileName);
                BlobSasBuilder sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = _fileMainContainer,
                    BlobName = dicContainers + "/" + fileName,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(10)
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);

                Uri sasUri = blobClient.GenerateSasUri(sasBuilder);
                _logger.LogInformation($"SAS URL generated successfully for {dicContainers}/{fileName}");
                return Ok(new { url = sasUri.ToString() });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error generating SAS URL: {ex.Message}, Stack: {ex.StackTrace}");
                return StatusCode(500, new { error = "An error occurred while generating SAS URL.", details = ex.Message });
            }
        }
    }
}
