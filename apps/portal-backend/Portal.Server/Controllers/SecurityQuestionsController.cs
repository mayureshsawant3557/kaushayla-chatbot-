
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;

[AllowAnonymous]
[Route("api/[controller]")]
[ApiController]
public class SecurityQuestionsController : ControllerBase
{
    private readonly string _connectionString;

    public SecurityQuestionsController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DBConnection") ?? throw new ArgumentNullException(nameof(configuration));
    }

    [HttpGet]
    public IActionResult GetSecurityQuestions()
    {
        List<object> questions = new List<object>();

        // Add the "Select" option first
        //questions.Add(new { Id = 0, Question = "Select" });
        try
        {
            using (SqlConnection con = new SqlConnection(_connectionString))
            {
                string query = "SELECT SecurityQuestionID, SecurityQuestion FROM Master_SecurityQuestion WHERE IsActive = 1";
                SqlCommand cmd = new SqlCommand(query, con);

                con.Open();
                SqlDataReader reader = cmd.ExecuteReader();

                while (reader.Read())
                {
                    questions.Add(new
                    {
                        Id = reader["SecurityQuestionID"],  // Corrected Column Name
                        Question = reader["SecurityQuestion"].ToString() // Corrected Column Name
                    });
                }

                reader.Close();
            }

            return Ok(questions);
        }
        catch (SqlException ex)
        {
            return StatusCode(500, $"Database error: {ex.Message}");
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }


      

    }

}
