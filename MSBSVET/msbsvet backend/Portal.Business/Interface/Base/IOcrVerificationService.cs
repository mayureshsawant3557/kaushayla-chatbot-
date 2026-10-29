using System.Threading.Tasks;

namespace Portal.Business.Interface.Base
{
    public class OcrVerificationResult
    {
        public bool Success { get; set; } = true;
        public bool Verified { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public interface IOcrVerificationService
    {
        /// <summary>
        /// Verifies a document via the Python OCR backend.
        /// </summary>
        /// <param name="fileUrl">The URL or path of the uploaded document.</param>
        /// <param name="documentType">The type of document ("registration_certificate" or "pan").</param>
        /// <param name="expectedNumber">The number expected to be found in the document.</param>
        /// <returns>True if the number is found; otherwise, false.</returns>
        Task<bool> VerifyDocumentAsync(string fileUrl, string documentType, string expectedNumber);

        /// <summary>
        /// Verifies a document via the Python OCR backend with detailed result.
        /// </summary>
        Task<OcrVerificationResult> VerifyDocumentDetailedAsync(string fileUrl, string documentType, string expectedNumber);
    }
}
