using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.FirebaseNotification
{
    public class ServiceResponse<T>
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public string ErrorCode { get; set; }

        public static ServiceResponse<T> SuccessResponse(T data, string message = "Success")
        {
            return new ServiceResponse<T>
            {
                IsSuccess = true,
                //Message = message,
                Data = data
            };
        }

        public static ServiceResponse<T> FailureResponse(string message, string errorCode = null)
        {
            return new ServiceResponse<T>
            {
                IsSuccess = false,
                Message = message,
                ErrorCode = errorCode
            };
        }
    }
}
