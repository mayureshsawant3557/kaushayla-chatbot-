using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.DVETO;
using Portal.Business.Worker.Utility;
using Portal.Entities.DVETO;

namespace Portal.Server.Controllers.DVETO
{
    [ApiController]
    [Route("api/[controller]")]
   // [EnableCors("AllowAll")]   // Use the CORS policy you defined in Program.cs
    public class DVETOBaseController : ControllerBase
    {
        private readonly IDVETOBase _DVETOBase;

        public DVETOBaseController(IDVETOBase DVETOBase)
        {
            _DVETOBase = DVETOBase ?? throw new ArgumentNullException(nameof(DVETOBase));
        }

        [HttpGet("GetOfficeDetails/{officeId}/{userLoginId}")]
        public IActionResult GetOfficeDetails(long officeId, string userLoginId)
        {
            try
            {
                if (officeId <= 0 || string.IsNullOrWhiteSpace(userLoginId))
                {
                    return BadRequest("Invalid OfficeID or UserLoginID.");
                }

                var result = _DVETOBase.GetOfficeDetails(officeId, userLoginId);

                if (result == null)
                    return NotFound("Office details not found.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving office details: {ex.Message}");
            }
        }

        [HttpPost("SaveOfficeDetails")]
        [AllowAnonymous]
        public IActionResult SaveOfficeDetails([FromBody] DVETOBaseEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest("Invalid request data.");
                }

                var result = _DVETOBase.SaveOfficeDetails(entity);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error saving office details: {ex.Message}");
            }
        }


        [HttpGet("GetAdminDashboard")]
        public IActionResult GetAdminDashboard([FromQuery] int userTypeId, [FromQuery] string userLoginId)
        {
            try
            {
                // Assuming your service/worker interface (e.g., _dashboardWorker) is injected into the controller
                var result = _DVETOBase.GetAdminDashboard(userTypeId, userLoginId);

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(new
                    {
                        Status = "Error",
                        Message = "Data not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Data retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                // Logging the exception 
                CommonHelper.SaveException(ex.Message, "GetAdminDashboard", userLoginId);

                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }

    }
}