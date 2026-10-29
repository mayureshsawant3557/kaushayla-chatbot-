using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Attendance
{
    public class PunchInRequest
    {
        [Required(ErrorMessage = "Latitude is required")]
        [Range(-90, 90, ErrorMessage = "Latitude must be between -90 and 90")]
        public double Latitude { get; set; }

        [Required(ErrorMessage = "Longitude is required")]
        [Range(-180, 180, ErrorMessage = "Longitude must be between -180 and 180")]
        public double Longitude { get; set; }

        [StringLength(1000, ErrorMessage = "Daily plan cannot exceed 1000 characters")]
        public string DailyPlan { get; set; }

        [StringLength(500, ErrorMessage = "Remark cannot exceed 500 characters")]
        public string Remark { get; set; }

        public IFormFile? Selfie { get; set; }

        public string WorkSummary { get; set; }     // For Tesing

        public DateTime? AttendanceDate { get; set; }

        public DateTime? PunchInT { get; set; }
    }
}
