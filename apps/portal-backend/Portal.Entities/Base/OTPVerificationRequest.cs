using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Base
{
    public class OTPVerificationRequest
    {
        [Required]
        [Phone]
        public string MobileNo { get; set; }

        [Required]
        public string Purpose { get; set; }

        [Required]
        public string OTP { get; set; }

        public bool IsOTPVerified { get; set; }
    }
}
