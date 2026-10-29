using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;

namespace Portal.Server.Controllers
{
    [AllowAnonymous]
    [ApiController]
    [Route("[controller]")]
    public class MenuController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetMenu()
        {
            try
            {
                var menuItems = new List<object>
                {
                    new { label = "Home", link = "/", orderClass = "order-first" },
                    new
                    {
                        label = "About",
                        link = "/about",
                        dropdown = true,
                        dropdownItems = new List<object>
                        {
                            new { label = "About_Board", link = "/about/board" },
                            new { label = "Vision", link = "/board/vision" },
                            new { label = "Mission", link = "/board/mission" },
                            new { label = "Values", link = "/board/values" },
                            new { label = "Objectives", link = "/board/objectives" },
                            new { label = "Goals", link = "/board/goals" },
                            new { label = "Organization_Structure", link = "/board/organization" },
                            new { label = "Governing_Board", link = "/board/governing-board" },
                            new { label = "Governing_Council", link = "/board/governing-council" },
                            new { label = "Office_Bearers", link = "/board/office-bearers" }
                           
                        },
                        orderClass = "order-first"
                    },
                    new { label = "Search_Institute", link = "/institutes/search" },
                    new { label = "Courses", link = "/courses" },
                    new
                    {
                        label = "Examination",
                        link = "/examination",
                        dropdown = true,
                        dropdownItems = new List<object>
                        {
                            new { label = "Exam_Circular", link = "/examination/circular" },
                            new { label = "Exam_Pattern", link = "/examination/pattern" },
                            new { label = "Exam_Timetable", link = "/examination/timetable" },
                            new { label = "Exam_Hall_Ticket", link = "/examination/hall-ticket" },
                            new { label = "Exam_Result", link = "/examination/result" },
                            new { label = "Certificate_Verification", link = "/examination/certificate-verification" },
                            new { label = "Exam_Related_Services", link = "/examination/services" }
                        }
                    },
                    new
                    {
                        label = "Certificates_Verification",
                        link = "/certificates",
                        dropdown = true,
                        dropdownItems = new List<object>
                        {
                            new { label = "Certificate_Verification_2016_2020", link = "/certificate/verification/2016-2020" },
                            new { label = "Certificate_Verification_2021_2022", link = "/certificate/verification/2021-2022" },
                            new { label = "Download_Certificate_2016_2020", link = "/certificate/download/2016-2020" },
                            new { label = "Download_Certificate_2021_2022", link = "/certificate/download/2021-2022" }
                        }
                    },
                    new { label = "Contact_Us", link = "/contact" },
                    new { label = "Unauthorized_Institutes", link = "/unauthorized" },
                    new { label = "Assistance", link = "/assistance" },
                    new { label = "Dashboard", link = "/dashboard", orderClass = "order-last" }
                };

                return Ok(new { Status = "Success", Data = menuItems });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = "An error occurred while fetching the menu.", details = ex.Message });
            }
        }
    }
}