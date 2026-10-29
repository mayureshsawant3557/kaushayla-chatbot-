
//using Microsoft.AspNetCore.Mvc;
//using Portal.Business.Interface.MasterMgmt;
//using Portal.Entities.MasterMgmt;
//using System;
//using System.Data;

//namespace Portal.API.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class CourseDetailsController : ControllerBase
//    {
//        private readonly ICourseDetails _courseDetails;

//        public CourseDetailsController(ICourseDetails courseDetails)
//        {
//            _courseDetails = courseDetails;
//        }

//        // ✅ Save Course
//        [HttpPost("SaveCourse")]
//        public IActionResult SaveCourse([FromBody] NewCourseEntity courseEntity)
//        {
//            try
//            {
//                string createdBy = "Admin"; // you can take from token/session
//                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

//                var result = _courseDetails.
//                    (courseEntity, createdBy, ipAddress);

//                return Ok(new { message = result });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ex.Message);
//            }
//        }

//        // ✅ Get Course By ID
//        [HttpGet("GetCourseByID/{courseId}")]
//        public IActionResult GetCourseByID(long courseId)
//        {
//            try
//            {
//                var data = _courseDetails.GetCourseByID(courseId);
//                return Ok(data);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ex.Message);
//            }
//        }

//        // ✅ Get TimeTable For Edit
//        [HttpGet("GetTimeTableForEdit")]
//        public IActionResult GetTimeTableForEdit(long courseId, int examinationId)
//        {
//            try
//            {
//                DataTable dt = _courseDetails.GetTimeTableForEdit(courseId, examinationId);
//                return Ok(dt);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ex.Message);
//            }
//        }

//        // ✅ Update Course Display Admission New Unit
//        [HttpPost("UpdateCourseDisplayAdmissionNewUnit")]
//        public IActionResult UpdateCourseDisplayAdmissionNewUnit(long courseId, string updateCol, string value)
//        {
//            try
//            {
//                var result = _courseDetails.UpdateCourseDisplayAdmissionNewUnit(courseId, updateCol, value);
//                return Ok(new { message = result });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, ex.Message);
//            }
//        }
//    }
//}