using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.DVETO;
using Portal.Business.Interface.Institute;
using Portal.Business.Interface.RO;
using Portal.Business.Worker.Utility;
using Portal.Entities.ResponseBody;
using Portal.Entities.RO;
using System;
using System.Collections.Generic;
using System.Data;


namespace Portal.Server.Controllers.RO
{

    [ApiController]
    [Route("api/[controller]")]
    public class ROController : ControllerBase
  

    {
        private readonly IROBase _IROBase;

        public ROController(IROBase iROBase)
        {
            _IROBase = iROBase ?? throw new ArgumentNullException(nameof(iROBase));
        }

        [HttpGet]
        [Route("GetROManagementDetails")]
        public IActionResult GetROManagementDetails([FromQuery] long roID)
        {
            try
            {
                var result = _IROBase.GetROManagementDetails(roID);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<ROManagementDetailsEntity>>.SuccessResponse(
                        result,
                        "RO management details retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<ROManagementDetailsEntity>>.SuccessResponse(
                        new List<ROManagementDetailsEntity>(),
                        "No management details found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetROManagementDetails", roID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveROManagementDetails")]
        public IActionResult SaveROManagementDetails([FromBody] ROManagementDetailsEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));
                var result = _IROBase.SaveROManagementDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "RO management details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet("ROGetRoManagementTypeByRoID/{ROID}/{managementType}")]
        public IActionResult RO_GetRo_ManagementTypeByRoID(long ROID, int managementType)
        {
            try
            {
                if (ROID <= 0 || managementType <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid institute or management type." });

                DataTable result = _IROBase.RO_GetRo_ManagementTypeByRoID(ROID, managementType);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(new { Status = "Error", Message = "Data not found." });

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
                CommonHelper.SaveException(ex.Message, "RO_GetRo_ManagementTypeByRoID");
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
