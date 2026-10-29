using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.DVET;

using Portal.Business.Worker.DVET;
using Portal.Business.Worker.Utility;
using Portal.Entities.DVET;
using Portal.Entities.ResponseBody;
namespace Portal.Server.Controllers.DVET
{

    [ApiController]
    [Route("api/[controller]")]
    public class DVETController : ControllerBase
    {
        private readonly IDVET _IDVET;

        public DVETController(IDVET iDVET)
        {
            _IDVET = iDVET ?? throw new ArgumentNullException(nameof(iDVET));
        }
        [HttpPost]
        [Route("StateFund_SaveAllocation")]
        public IActionResult StateFund_SaveAllocation(
    [FromBody] SaveStateFundAllocationRequest entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Invalid request data.",
                            400));
                }

                var result = _IDVET.StateFund_SaveAllocation(entity);

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "State Fund saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "StateFund_SaveAllocation");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        ex.Message,
                        500));
            }
        }
        [HttpGet]
        [Route("StateFund_GetAllocation")]
        public IActionResult StateFund_GetAllocation([FromQuery] int FinancialYearID)
        {
            try
            {
                var result = _IDVET.StateFund_GetAllocation(FinancialYearID);

                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No State Fund allocation found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(
                    result,
                    "State Fund allocation fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "StateFund_GetAllocation",
                    FinancialYearID.ToString());

                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse(
                        ex.Message, 500));
            }
        }




    }

}