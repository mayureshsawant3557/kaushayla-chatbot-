namespace Portal.Entities.ResponseBody
{
    public class ApiResponse<T>
    {
        public string Status { get; set; } // e.g., "Success", "Error"
        public int StatusCode { get; set; } // HTTP status code (200, 400, etc.)
        public string Message { get; set; } // Message for the response
        public T Data { get; set; } // Generic data payload

        public ApiResponse(string status, int statusCode, string message, T data)
        {
            Status = status;
            StatusCode = statusCode;
            Message = message;
            Data = data;
        }

        // Success response helper
        public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful", int statusCode = 200)
        {
            return new ApiResponse<T>("Success", statusCode, message, data);
        }

        // Error response helper
        public static ApiResponse<T> ErrorResponse(string message, int statusCode =400 ) //400
        {
            return new ApiResponse<T>("Error", statusCode, message, default);
        }
    }
}