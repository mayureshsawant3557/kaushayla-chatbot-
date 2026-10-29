using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Attendance
{
    public class FaceEnrollmentRequest
    {
        [Required(ErrorMessage = "Face image URL is required")]
        [Url(ErrorMessage = "Please provide a valid URL")]
        public string FaceImageUrl { get; set; }

        [StringLength(500, ErrorMessage = "Note cannot exceed 500 characters")]
        public string Note { get; set; }
    }
}
