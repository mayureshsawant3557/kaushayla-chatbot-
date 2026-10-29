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
    public class UserManagementController : ControllerBase
    {
        private readonly IManageUsers _userManagement;

        public UserManagementController(IManageUsers userManagement)
        {
            _userManagement = userManagement;
        }

        [HttpGet("GetUsersList")]
        public IActionResult GetUsersList(int userTypeID)
        {
            try
            {
                var result = _userManagement.GetUsersList(userTypeID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("SearchUserById")]
        public IActionResult SearchUserById([FromQuery] string searchTerm, [FromQuery] int userTypeID = 0)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Please enter a User Login ID or Name to search."
                    });
                }

                // You might want to use userTypeID for filtering if needed
                var result = _userManagement.SearchUserById(searchTerm);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = $"No user found matching '{searchTerm}'."
                    });
                }

                var usersList = BaseWorker.ConvertDataTableToList(result);

                return Ok(new
                {
                    success = true,
                    message = $"{usersList.Count} user(s) found matching '{searchTerm}'.",
                    data = usersList
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        [HttpPost("ActivateOrDeactivateUser")]
        public IActionResult ActivateOrDeactivateUser([FromBody] ActivateOrDeactivateUserRequest request)
        {
            try
            {
                var result = _userManagement.ActivateOrDeactivateUser(
                    request.UserID,
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

        [HttpPost("SaveUser")]
        public IActionResult SaveUser([FromBody] UserEntity entity)
        {
            try
            {
                var result = _userManagement.SaveUser(entity);
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetUserDetails/{userID}")]
        public IActionResult GetUserDetails(long userID)
        {
            try
            {
                var result = _userManagement.GetUserDetails(userID);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut("EditUser")]
        public IActionResult EditUser([FromBody] UserEntity entity)
        {
            try
            {
                var result = _userManagement.EditUser(entity);

                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }

    // Request DTO
    public class ActivateOrDeactivateUserRequest
    {
        public long UserID { get; set; }
        public string ModifiedBy { get; set; }
        public string ModifiedByIPAddress { get; set; } = string.Empty; 
    }
}