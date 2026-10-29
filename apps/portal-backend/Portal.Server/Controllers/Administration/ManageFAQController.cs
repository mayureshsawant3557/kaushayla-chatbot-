using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business;
using Portal.Business.Worker.Base;
using Portal.Entities;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;

namespace Portal.API.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("api/[controller]")]
    public class ManageFAQController : ControllerBase
    {
        private readonly IManageFAQ _faq;

        public ManageFAQController(IManageFAQ faq)
        {
            _faq = faq;
        }


        [HttpGet("GetFAQListForDisplay")]
        public IActionResult GetFAQListForDisplay([FromQuery] short RegionID, [FromQuery] string Language)
        {
            var result = _faq.GetFAQListForDisplay(RegionID, Language);
            var serializableData = BaseWorker.ConvertDataTableToList(result);
            return Ok(ApiResponse<object>.SuccessResponse(serializableData, "FAQ list for display retrieved successfully."));
        }

       
        [HttpGet("GetFAQList")]
        public IActionResult GetFAQList([FromQuery] short RegionID)
        {
            var result = _faq.GetFAQList(RegionID);
            var serializableData = BaseWorker.ConvertDataTableToList(result);
            return Ok(ApiResponse<object>.SuccessResponse(serializableData, "FAQ list retrieved successfully."));
        }

        [HttpGet("GetFAQDetails")]
        public IActionResult GetFAQDetails([FromQuery] int FAQID)
        {
            var faq = _faq.GetFAQDetails(FAQID);
            if (faq == null)
                return NotFound(ApiResponse<object>.ErrorResponse("FAQ not found.", 404));
            return Ok(ApiResponse<FAQEntity>.SuccessResponse(faq, "FAQ details retrieved successfully."));
        }

        [HttpPost("SaveFAQ")]
        public IActionResult SaveFAQ([FromBody] FAQEntity entity)
        {
            var responseMessage = _faq.SaveFAQ(entity);
            if (responseMessage.ToLower().Contains("success"))
                return Ok(ApiResponse<string>.SuccessResponse(null, responseMessage));
            return BadRequest(ApiResponse<string>.ErrorResponse(responseMessage, 400));
        }

        [HttpPost("SaveFAQSeqNo")]
        public IActionResult SaveFAQSeqNo([FromBody] List<FAQEntity> ListEntity)
        {
            var responseMessage = _faq.SaveFAQSeqNo(ListEntity);
            if (responseMessage.ToLower().Contains("success"))
                return Ok(ApiResponse<string>.SuccessResponse(null, responseMessage));
            return BadRequest(ApiResponse<string>.ErrorResponse(responseMessage, 400));
        }

        [HttpDelete("DeleteFAQ")]
        public IActionResult DeleteFAQ([FromQuery] int FAQID, [FromQuery] string UserLoginID, [FromQuery] string IPAddress)
        {
            var responseMessage = _faq.DeleteFAQ(FAQID, UserLoginID, IPAddress);
            if (responseMessage.ToLower().Contains("success"))
                return Ok(ApiResponse<string>.SuccessResponse(null, responseMessage));
            return BadRequest(ApiResponse<string>.ErrorResponse(responseMessage, 400));
        }
    }


}
