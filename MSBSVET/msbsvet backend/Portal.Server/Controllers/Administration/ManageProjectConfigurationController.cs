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
    public class ProjectConfigurationController : ControllerBase
    {
        private readonly IManageProjectConfiguration _projectConfiguration;

        public ProjectConfigurationController(IManageProjectConfiguration projectConfiguration)
        {
            _projectConfiguration = projectConfiguration;
        }

        [HttpGet("GetProjectConfigurationList")]
        public IActionResult GetProjectConfigurationList(short regionID)
        {
            try
            {
                var result = _projectConfiguration.GetProjectConfigurationList(regionID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetProjectConfigurationDetails")]
        public IActionResult GetProjectConfigurationDetails(short regionID, string appKey)
        {
            try
            {
                var result = _projectConfiguration.GetProjectConfigurationDetails(regionID, appKey);
               // var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("SaveProjectConfigurationDetails")]
        public IActionResult SaveProjectConfigurationDetails([FromBody] SaveProjectConfigurationDetailsRequest request)
        {
            try
            {
                var result = _projectConfiguration.SaveProjectConfigurationDetails(
                    request.RegionID,
                    request.AppKey,
                    request.AppValue,
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
    public class SaveProjectConfigurationDetailsRequest
    {
        public short RegionID { get; set; }
        public string AppKey { get; set; }
        public string AppValue { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; }
    }
}