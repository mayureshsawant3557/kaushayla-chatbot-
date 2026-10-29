using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Portal.Data.Source;




namespace Portal.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DatabaseController : ControllerBase
    {
        private readonly Connection _dbHelper;

        public DatabaseController(Connection dbHelper)
        {
            _dbHelper = dbHelper;
        }

        [HttpGet("test-connection")]
        public IActionResult TestDatabaseConnection()
        {
            using (SqlConnection conn = _dbHelper.GetConnection())
            {
                try
                {
                    conn.Open();
                    return Ok("Database Connection Successful!");
                }
                catch (Exception ex)
                {
                    return StatusCode(500, "Database Connection Failed: " + ex.Message);
                }
            }
        }
    }
}
