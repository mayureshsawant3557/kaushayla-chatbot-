using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Portal.Server.Controllers;

[ApiController]
[Route("api/security")]
public class SecurityController : ControllerBase
{
    private readonly IConfiguration _configuration;

    public SecurityController(IConfiguration configuration)
    {
        _configuration = configuration;
    }
    [AllowAnonymous]
    [HttpGet("public-key")]
    public IActionResult GetPublicKey()
    {
        var publicKey = _configuration["Encryption:PublicKey"];

        if (string.IsNullOrWhiteSpace(publicKey))
        {
            return StatusCode(500, new
            {
                ErrorMessage = "Public key not configured"
            });
        }

        return Ok(publicKey);
    }
}
