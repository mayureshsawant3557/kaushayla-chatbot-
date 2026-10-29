using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.MasterMgmt;
using Portal.Business.Worker.Base;
using Portal.Entities.MasterMgmt;
using Portal.Entities.ResponseBody;
using System;

namespace Portal.Server.Controllers.MasterMgmt
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class CourseDetailsController : ControllerBase
    {
        private readonly ICourseDetails _courseDetails;

        public CourseDetailsController(ICourseDetails courseDetails)
        {
            _courseDetails = courseDetails;
        }
        [AllowAnonymous]
        [HttpGet]
        [Route("GetCourseByID")]
        public IActionResult GetCourseByID(long CourseID)
        {
            try
            {
                var result = _courseDetails.GetCourseByID(CourseID);

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "Course not found.",
                            404
                        )
                    );
                }

                return Ok(
                    ApiResponse<NewCourseEntity>.SuccessResponse(
                        result,
                        "Course details retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }

        [HttpPost]
        [Route("SaveCourse")]
        public IActionResult SaveCourse(
            [FromBody] NewCourseEntity entity,
            string CreatedBy,
            string CreatedByIPAddress
        )
        {
            try
            {
                var result = _courseDetails.SaveCourse(
                    entity,
                    CreatedBy,
                    CreatedByIPAddress
                );
                
                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Course saved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }

        [HttpGet]
        [Route("GetTimeTableForEdit")]
        public IActionResult GetTimeTableForEdit(long CourseID, int ExaminationID)
        {
            try
            {
                var result = _courseDetails.GetTimeTableForEdit(
                    CourseID,
                    ExaminationID
                );

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No timetable records found.",
                            404
                        )
                    );
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        serializableData,
                        "Timetable retrieved successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }

        [HttpPost]
        [Route("UpdateCourseDisplayAdmissionNewUnit")]
        public IActionResult UpdateCourseDisplayAdmissionNewUnit(
            long CourseID,
            string UpdateCol,
            string Value
        )
        {
            try
            {
                var result = _courseDetails.UpdateCourseDisplayAdmissionNewUnit(
                    CourseID,
                    UpdateCol,
                    Value
                );

                return Ok(
                    ApiResponse<string>.SuccessResponse(
                        result,
                        "Course updated successfully."
                    )
                );
            }
            catch (Exception ex)
            {
                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }
    }
}