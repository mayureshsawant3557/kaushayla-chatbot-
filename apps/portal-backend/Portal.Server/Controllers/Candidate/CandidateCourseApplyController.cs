 using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Candidate;
using Portal.Business.Worker.Utility;
using Portal.Entities.Institute;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;

namespace Portal.Server.Controllers.Candidate
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateCourseApplyController : ControllerBase
    {
        private readonly ICandidateCourseApply _candidateCourseApply;

        public CandidateCourseApplyController(ICandidateCourseApply candidateCourseApply)
        {
            _candidateCourseApply = candidateCourseApply ?? throw new ArgumentNullException(nameof(candidateCourseApply));
        }

        [HttpPost("ApplyForCourse")]
        public IActionResult ApplyForCourse([FromBody] CourseApplyEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid course application data.", 400));
            }

            try
            {
                string result = _candidateCourseApply.ApplyForCourse(entity);
                if (result.ToUpper() == "N")
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to Apply . Please try again.", 400));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "Course applied successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet("GetAppliedCourses")]
        public IActionResult GetAppliedCourses(long candidateId, long applicationId, short admissionYearId)
        {
            try
            {
                List<InstituteListEntity> courses = _candidateCourseApply.GetAppliedCourse(candidateId, applicationId, admissionYearId);
                if (courses == null || courses.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No applied courses found.", 404));
                }
                return Ok(ApiResponse<List<InstituteListEntity>>.SuccessResponse(courses, "Applied courses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpGet("GetAppliedCourseByCandidateIDApplicationId")]
        public IActionResult GetAppliedCourseByCandidateID([FromQuery] long candidateId, [FromQuery] long applicationId)
        {
            if (candidateId <= 0 || applicationId <= 0)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid CandidateID or ApplicationID.", 400));
            }

            try
            {
                var appliedCourses = _candidateCourseApply.GetAppliedCourseByCandidateID(candidateId, applicationId);

                if (appliedCourses == null || appliedCourses.Count == 0)
                {
                    Console.WriteLine("No applied courses found.");
                    return NotFound(ApiResponse<object>.ErrorResponse("No applied courses found.", 404));
                }

                Console.WriteLine("Applied courses retrieved successfully.");
                return Ok(ApiResponse<object>.SuccessResponse(appliedCourses, "Applied courses retrieved successfully.", 200));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in API: {ex.Message}");
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        //[HttpGet("GetAppliedCourseByCandidateId")]
        //public IActionResult GetAppliedCoursesByCandidateId(long candidateId)
        //{
        //    try
        //    {
        //        List<InstituteListEntity> courses = _candidateCourseApply.GetAppliedCourseByCandidateID(candidateId);
        //        if (courses == null || courses.Count == 0)
        //        {
        //            return NotFound(ApiResponse<object>.ErrorResponse("No applied courses found.", 404));
        //        }
        //        return Ok(ApiResponse<List<InstituteListEntity>>.SuccessResponse(courses, "Applied courses retrieved successfully."));
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
        //    }
        //}

        [HttpGet("GetAppliedCourseByCandidateId")]
        public IActionResult GetAppliedCoursesByCandidateId(long candidateId)
        {
            try
            {
                List<InstituteListEntity> courses = _candidateCourseApply.GetAppliedCourseByCandidateID(candidateId);
                if (courses == null || courses.Count == 0)
                {
                    return Ok(ApiResponse<List<InstituteListEntity>>.SuccessResponse(courses,"Not Applied for course."));
                }
                return Ok(ApiResponse<List<InstituteListEntity>>.SuccessResponse(courses, "Applied courses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }

        [HttpDelete("DeleteAppliedCourse")]
        public IActionResult DeleteAppliedCourse([FromBody] CourseApplyEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid course deletion data.", 400));
            }

            try
            {
                string result = _candidateCourseApply.DeleteAppliedCourse(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Course deleted successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }



        [HttpDelete("DeleteAppliedCourseByCandidateId")]
        public IActionResult DeleteAppliedCourseByCandidateId([FromBody] CourseApplyEntity entity)
        {
            if (entity == null)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid course deletion request.", 400));
            }

            try
            {
                string result = _candidateCourseApply.DeleteAppliedCourseByCandidateID(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "All courses deleted for candidate successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse<object>.ErrorResponse(ex.Message, 500));
            }
        }
        [HttpGet("GetApplyForAdmissionEligibility")]
        public IActionResult GetApplyForAdmissionEligibility(
        [FromQuery] long candidateID,
        [FromQuery] string userLoginID)
        {
            if (candidateID <= 0)
            {
                return BadRequest(
                    ApiResponse<object>.ErrorResponse("Invalid CandidateID.", StatusCodes.Status400BadRequest)
                );
            }

            try
            {
                var result = _candidateCourseApply.GetApplyForAdmissionEligiblity(candidateID, userLoginID);

                if (result == null || result.Tables.Count == 0 || result.Tables[0].Rows.Count == 0)
                {
                    return Ok(
                        ApiResponse<object>.SuccessResponse(
                            result,
                            "No eligibility data found.",
                            StatusCodes.Status200OK
                        )
                    );
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Eligibility data retrieved successfully.",
                        StatusCodes.Status200OK
                    )
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    nameof(GetApplyForAdmissionEligibility),
                    candidateID.ToString()
                );

                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    ApiResponse<object>.ErrorResponse(
                        "An unexpected error occurred while processing the request.",
                        StatusCodes.Status500InternalServerError
                    )
                );
            }
        }

    }
}
