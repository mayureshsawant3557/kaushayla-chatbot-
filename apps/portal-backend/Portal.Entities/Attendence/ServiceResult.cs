using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Portal.Entities.Attendence
{
    public class ServiceResult<T>
    {
        public bool IsSuccess { get; init; }
        public int StatusCode { get; init; }
        public string Message { get; init; } = string.Empty;
        public T? Data { get; init; }
        public string? ErrorCode { get; init; }

        public static ServiceResult<T> SuccessResponse( T data, string message = "Success")
        {
            return new()
            {
                IsSuccess = true,
                //Message = message,
                Data = data
            };
        }

        public static ServiceResult<T> FailureResponse(string message,int statusCode = 400, string? errorCode = null)
        {
            return new()
            {
                IsSuccess = false,
                StatusCode = statusCode,
                Message = message,
                ErrorCode = errorCode
            };
        }
    }
}
