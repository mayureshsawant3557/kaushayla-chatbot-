using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Attendance
{
    public class PhotoUploadDto
    {
        public IFormFile Photo { get; set; }
    }
    public class PhotoUploadResult
    {
        public bool success { get; set; }
        public string message { get; set; }
        public string url { get; set; }
        public string permanentUrl { get; set; }
        public string fileName { get; set; }
        public string uniqueFileName { get; set; }
        public string filePath { get; set; }
        public long uploadTimestamp { get; set; }
        public FaceValidationResult faceValidation { get; set; }
    }

    public class FaceValidationResult
    {
        public bool verified { get; set; }
        public bool isHumanFace { get; set; }
    }
}
