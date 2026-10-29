using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Portal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ActivityStatusController : ControllerBase
    {
        private readonly IManageActivityStatus _activityStatus;

        public ActivityStatusController(IManageActivityStatus activityStatus)
        {
            _activityStatus = activityStatus;
        }

        [HttpGet("GetActivityStatusList")]
        public IActionResult GetActivityStatusList(short regionID)
        {
            try
            {
                var result = _activityStatus.GetActivityStatusList(regionID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        //[HttpGet("GetActivityStatusDetails")]
        //public IActionResult GetActivityStatusDetails(short regionID, string activityName)
        //{
        //    try
        //    {
        //        var result = _activityStatus.GetActivityStatusDetails(regionID, activityName);
        //        var serializableData = BaseWorker.ConvertDataTableToList(result);
        //        return Ok(new { success = true, data = serializableData });
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest(new { success = false, message = ex.Message });
        //    }
        //}

        [HttpPost("SaveActivityStatusDetails")]
        public IActionResult SaveActivityStatusDetails([FromBody] SaveActivityStatusDetailsRequest request)
        {
            try
            {
                var result = _activityStatus.SaveActivityStatusDetails(
                    request.RegionID,
                    request.ActivityName,
                    request.ActivityStartDateTime,
                    request.ActivityEndDateTime,
                    request.ModifiedBy,
                    request.ModifiedByIPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTO
    public class SaveActivityStatusDetailsRequest
    {
        public short RegionID { get; set; }
        public string ActivityName { get; set; }
        public DateTime? ActivityStartDateTime { get; set; }
        public DateTime? ActivityEndDateTime { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }
    }
}