using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Administration;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Candidate;
using Portal.Entities;
using Portal.Entities.Base;
using Portal.Entities.Candidate;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;

namespace Portal.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdministrationController : ControllerBase
    {
        private readonly IAdministration _administration;

        public AdministrationController(IAdministration administration)
        {
            _administration = administration;
        }

        [HttpGet("GetAllExamFees")]
        public IActionResult GetAllExamFees()
        {
            try
            {
                var result = _administration.GetAllExamFees();
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetExamFees")]
        public IActionResult GetExamFees(int courseTypeID, int examTypeID)
        {
            try
            {
                var result = _administration.GetExamFees(courseTypeID, examTypeID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetExamFeesByID/{id}")]
        public IActionResult GetExamFeesByID(int id)
        {
            try
            {
                var result = _administration.GetExamFeesByID(id);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("SaveExamFees")]
        public IActionResult SaveExamFees([FromBody] SaveExamFeesRequest request)
        {
            try
            {
                var result = _administration.SaveExamFees(
                    request.CourseTypeID,
                    request.ExamTypeID,
                    request.BoardFees,
                    request.AssessmentFees,
                    request.ExamFees,
                    request.ImplementationDate,
                    request.UserLoginID,
                    request.IpAddress
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetEvaluationForUnlock")]
        public IActionResult GetEvaluationForUnlock(long batchID, string subjectCode, string subjectType)
        {
            try
            {
                var result = _administration.GetEvaluationForUnlock(batchID, subjectCode, subjectType);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("UpdateEvaluationMarksUnlock")]
        public IActionResult UpdateEvaluationMarksUnlock([FromBody] UpdateEvaluationMarksUnlockRequest request)
        {
            try
            {
                var result = _administration.UpdateEvaluationMarksUnlock(
                    request.BatchID,
                    request.SubjectCode,
                    request.UserLoginID,
                    request.IpAddress,
                    request.SubjectType
                );
                return Ok(new { message = result });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetInstituteCourseBatches")]
        public IActionResult GetInstituteCourseBatches(long instituteID, long courseID, int admissionYearID, bool isAttendanceDashboard = false)
        {
            try
            {
                var result = _administration.GetInstituteCourseBatche(instituteID, courseID, admissionYearID, isAttendanceDashboard);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("GetBatchWiseAdmittedCandidate/{batchID}")]
        public IActionResult GetBatchWiseAdmittedCandidate(long batchID)
        {
            try
            {
                var result = _administration.GetBatchWiseAdmittedCandidate(batchID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                return Ok(serializableData);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [AllowAnonymous]
        [HttpGet("GetContactOfficeList")]
        public IActionResult GetContactOfficeList()
        {
            try
            {
                var data = _administration.GetManageContactUs();
                if (data == null || data.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No contact office data found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(data, "Contact offices retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetCandidatePhotoDetails")]
        public IActionResult GetCandidatePhotoDetails(string ProfileId)
        {
            try
            {
                var result = _administration.GetCandidatePhotoDetails(ProfileId);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No Data Found.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("UpdateFixedOrientationIssueImage")]
        public IActionResult UpdateFixedOrientationIssueImage([FromBody] CandidateUpdatedImageEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<object>.ErrorResponse("Candidate primary entity cannot be null.", 400));

            var result = _administration.UpdateFixedOrientationIssueImage(entity);

            if (string.IsNullOrEmpty(result) || result == "N")
                return BadRequest(ApiResponse<object>.ErrorResponse("Failed to save candidate details.", 400));

            //var responseData = new { Message = "Candidate details saved successfully.", CandidateID = result };
            return Ok(ApiResponse<object>.SuccessResponse(result, "Candidate details saved successfully.", 200));
        }
    }

    // Request DTOs
    public class SaveExamFeesRequest
    {
        public int CourseTypeID { get; set; }
        public int ExamTypeID { get; set; }
        public int BoardFees { get; set; }
        public int AssessmentFees { get; set; }
        public int ExamFees { get; set; }
        public DateTime? ImplementationDate { get; set; }
        public string UserLoginID { get; set; }
        public string IpAddress { get; set; }
    }

    public class UpdateEvaluationMarksUnlockRequest
    {
        public long BatchID { get; set; }
        public string SubjectCode { get; set; }
        public string UserLoginID { get; set; }
        public string IpAddress { get; set; }
        public string SubjectType { get; set; }
    }
}