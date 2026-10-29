using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Base;
using Portal.Entities.Administration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Portal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SQLQueryExecutorController : ControllerBase
    {
        private readonly ISQueryResult _sqlQueryExecutor;

        public SQLQueryExecutorController(ISQueryResult sqlQueryExecutor)
        {
            _sqlQueryExecutor = sqlQueryExecutor;
        }

        [HttpGet("GetAllSQLTablesDropDown")]
        public IActionResult GetAllSQLTablesDropDown()
        {
            try
            {
                var result = _sqlQueryExecutor.GetAllSQLTablesDropDown();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetSQueryExecutersMobileNumber")]
        public IActionResult GetSQueryExecutersMobileNumber()
        {
            try
            {
                var result = _sqlQueryExecutor.GetSQueryExecutersMobileNumber();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("ExecuteSQueryResult")]
        public IActionResult ExecuteSQueryResult([FromBody] SQueryResultEntity sQueryResultEntity)
        {
            try
            {
                var result = _sqlQueryExecutor.ExecuteSQueryResult(sQueryResultEntity);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetMobileAuthenticationFlag")]
        public IActionResult GetMobileAuthenticationFlag()
        {
            try
            {
                var result = _sqlQueryExecutor.GetMobileAuthenticationFlag();
                
                return Ok(new { flag = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}