using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Account
{
    public class ForgotPasswordEntity
    {
        public string? UserLoginID { get; set; }
        public Int16 SecurityQuestionID { get; set; }
        public string? SecurityQuestionAnswer { get; set; }
        public string? NewPassword { get; set; }
        public string? ErrorMessage { get; set; }
        public string? IPAddress { get; set; }
    }
}
