using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business;
using Portal.Business.Worker.Base;
using Portal.Entities;
using Portal.Entities.ResponseBody;
using System;

namespace Portal.API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class GrievanceController : ControllerBase
    {
        private readonly IGrievance _grievance;

        public GrievanceController(IGrievance grievance)
        {
            _grievance = grievance;
        }

        
        [HttpPost("SendGrievance")]
        public IActionResult SendGrievance([FromBody] GrievanceEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Grievance data is required.", 400));
                }

                long grievanceId = _grievance.SendGrievance(entity);

                if (grievanceId > 0)
                {
                    return Ok(ApiResponse<long>.SuccessResponse(grievanceId, "Grievance submitted successfully."));
                }
                else
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to submit grievance.", 400));
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("CheckGrievanceStatus")]
        public IActionResult CheckGrievanceStatus(long GrievanceID, [FromQuery] string MobileNo)
        {
            try
            {
                var result = _grievance.CheckGrievanceStatus(GrievanceID, MobileNo);

                if (result == null)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse("Grievance not found.", 404));
                }

                return Ok(ApiResponse<GrievanceEntity>.SuccessResponse(result, "Grievance status retrieved."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet("GetGrievanceDashboard")]
        public IActionResult GetGrievanceDashboard(int UserTypeID, string UserLoginID)
        {
            var result = _grievance.GetGrievanceDashboard(UserTypeID, UserLoginID);
            if (result == null || result.Tables.Count == 0)
                return NotFound(ApiResponse<object>.ErrorResponse("No dashboard data found.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Dashboard data retrieved successfully."));
        }

        [HttpGet("GetPendingGrievanceList")]
        public IActionResult GetPendingGrievanceList()
        {
            var result = _grievance.GetPendingGrievanceList();
            var serializableData = BaseWorker.ConvertDataTableToList(result);
            if (result == null || result.Rows.Count == 0)
                return NotFound(ApiResponse<object>.ErrorResponse("No pending grievances found.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Pending grievances retrieved successfully."));
        }

        [HttpGet("GetRepliedGrievanceList")]
        public IActionResult GetRepliedGrievanceList()
        {
            var result = _grievance.GetRepliedGrievanceList();
            var serializableData = BaseWorker.ConvertDataTableToList(result);
            if (result == null || result.Rows.Count == 0)
                return NotFound(ApiResponse<object>.ErrorResponse("No replied grievances found.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Replied grievances retrieved successfully."));
        }

        [HttpPost("ReplyGrievance")]
        public IActionResult ReplyGrievance([FromBody] GrievanceEntity entity)
        {
            var replyResult = _grievance.ReplyGrievance(entity);
            if (replyResult.ToLower().Contains("success"))
                return Ok(ApiResponse<string>.SuccessResponse(null, replyResult));
            return BadRequest(ApiResponse<string>.ErrorResponse(replyResult, 400));
        }
    }

}
