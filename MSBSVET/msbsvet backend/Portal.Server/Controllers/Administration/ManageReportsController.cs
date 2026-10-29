using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Administration;
using Portal.Business.Interface.Report;
using Portal.Business.Worker.Base;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Portal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReportController : ControllerBase
    {
        private readonly IManageReports _report;

        public ReportController(IManageReports report)
        {
            _report = report;
        }

        [HttpPost("SaveReport")]
        public IActionResult SaveReport([FromBody] SaveReportRequest request)
        {
            try
            {
                var result = _report.SaveReport(
                    request.ReportID,
                    request.ReportName,
                    request.ReportQuery,
                    request.RegionID,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("DeleteReport")]
        public IActionResult DeleteReport([FromBody] DeleteReportRequest request)
        {
            try
            {
                var result = _report.DeleteReport(
                    request.ReportID,
                    request.UserLoginID,
                    request.IPAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetReport/{reportID}")]
        public IActionResult GetReport(int reportID)
        {
            try
            {
                var result = _report.GetReport(reportID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetReportList")]
        public IActionResult GetReportList(short regionID)
        {
            try
            {
                var result = _report.GetReportList(regionID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("ExecuteReport/{reportID}")]
        public IActionResult ExecuteReport(int reportID)
        {
            try
            {
                var result = _report.ExecuteReport(reportID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetTableViewList")]
        public IActionResult GetTableViewList()
        {
            try
            {
                var result = _report.GetTableViewList();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetColumnList")]
        public IActionResult GetColumnList(string tableViewName)
        {
            try
            {
                var result = _report.GetColumnList(tableViewName);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetRestrictedKeywordList")]
        public IActionResult GetRestrictedKeywordList()
        {
            try
            {
                var result = _report.GetRestrictedKeywordList();
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTOs
    public class SaveReportRequest
    {
        public int ReportID { get; set; }
        public string ReportName { get; set; }
        public string ReportQuery { get; set; }
        public short RegionID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }

    public class DeleteReportRequest
    {
        public int ReportID { get; set; }
        public string UserLoginID { get; set; }
        public string IPAddress { get; set; }
    }
}