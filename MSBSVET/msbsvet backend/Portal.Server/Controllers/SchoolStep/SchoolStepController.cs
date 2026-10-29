using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.VisualBasic.Syntax;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.ExistingInstitute;
using Portal.Business.Interface.Fee;
using Portal.Business.Interface.Institute;
using Portal.Business.Interface.SchoolStep;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities;
using Portal.Entities.Institute;
using Portal.Entities.ITISpecification;
using Portal.Entities.ResponseBody;
using QuestPDF.Infrastructure;
using System.Data;
using System.Text.Json;
using System.Xml;
using System.Xml.Serialization;

namespace Portal.Server.Controllers.SchoolStep
{
    [Route("api/[controller]")]
    [ApiController]

    public class SchoolStepController : ControllerBase
    {
        private readonly ISchoolStep _ISchoolStep;
        public SchoolStepController(ISchoolStep iInstituteBase)
        {
            _ISchoolStep = iInstituteBase ?? throw new ArgumentNullException(nameof(iInstituteBase));
        }



        [HttpPost("GetShortTermSchoolStepCourseUnitDetails")]
        public IActionResult GetShortTermSchoolStepCourseUnitDetails([FromBody] InstituteInputEntity en)
        {
            try
            {
                if (en == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _ISchoolStep.GetShortTermSchoolStepCourseUnitDetails(en);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetProposedCourseUnitDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetSTTSchoolUnitByInstitute")]
        public IActionResult GetSTTSchoolUnitByInstitute(Int64 InstituteID)
        {
            try
            {
                if (InstituteID == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _ISchoolStep.GetSTTSchoolUnitByInstitute(InstituteID);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTSchoolUnitByInstitute");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetSTTSchoolBatchesByInstitute")]
        public IActionResult GetSTTSchoolBatchesByInstitute(Int64 UnitID)
        {
            try
            {
                if (UnitID == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _ISchoolStep.GetSTTSchoolBatchesByInstitute(UnitID);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTSchoolBatchesByInstitute");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("GetSTTSchoolBatchByBatchIDORUnitID")]
        public IActionResult GetSTTSchoolBatchByBatchIDORUnitID(Int64 UnitID, Int64 BatchID)
        {
            try
            {
                if (UnitID == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                var result = _ISchoolStep.GetSTTSchoolBatchByBatchIDORUnitID(UnitID, BatchID);
                return Ok(ApiResponse<DataSet>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTSchoolBatchByBatchIDORUnitID");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertOrUpdateSTTSchoolBatchDetails")]
        public IActionResult InsertOrUpdateSTTSchoolBatchDetails([FromBody] STTBatchEntity en)
        {
            try
            {
                if (en == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                string result = _ISchoolStep.InsertOrUpdateSTTSchoolBatchDetails(en);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Batch details Updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertOrUpdateSTTSchoolBatchDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("DeleteSTTSchoolBatchDetails")]
        public IActionResult DeleteSTTSchoolBatchDetails(long batchId, string deletedBy, string ipAddress)
        {
            try
            {
                if (batchId == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                string result = _ISchoolStep.DeleteSTTSchoolBatchDetails(batchId, deletedBy, ipAddress);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Batch Deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DeleteSTTSchoolBatchDetails");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("GetInstituteSchoolsWiseCourse")]
        public IActionResult GetInstituteSchoolsWiseCourse(long schoolId)
        {
            try
            {
                if(schoolId<=0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));
                }
                var result = _ISchoolStep.GetInstituteSchoolsWiseCourse(schoolId);
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetInstituteSchoolsWiseCourse");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        //[HttpGet("GetSchoolsList")]
        //public ActionResult<DataSet> GetSchoolsList(int instituteId, string filterStatus)
        //{
        //    try
        //    {
        //        var result = _ISchoolStep.GetSchoolsList(instituteId, filterStatus);
        //        return Ok(result);
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetSchoolsList", instituteId.ToString());
        //        return StatusCode(500, new { message = "An error occurred while retrieving schools list.", error = ex.Message });
        //    }
        //}
        [HttpGet("GetCandidateListByBatchID")]
        public ActionResult<DataSet> GetCandidateListByBatchID(long batchId)
        {
            try
            {
                if (batchId <= 0)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));
                }
                var result = _ISchoolStep.GetCandidateListByBatchID(batchId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetCandidateListByBatchID", batchId.ToString());
                return StatusCode(500, new { message = "An error occurred while retrieving candidate list.", error = ex.Message });
            }
        }
        [HttpPost("ConfirmSchoolStepAdmission")]
        public IActionResult ConfirmSchoolStepAdmission(long candidateId, string reportedBy, string reportedByIPAddress, long batchId)
        {
            try
            {
                if (candidateId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                string result = _ISchoolStep.ConfirmSchoolStepAdmission(candidateId, reportedBy, reportedByIPAddress, batchId);

                if (result == "Y")
                    return Ok(ApiResponse<string>.SuccessResponse(result, "Confirmed School Step Admission."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse(result ?? "Admission Failed"));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "ConfirmSchoolStepAdmission");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("GetSTTBatchByBatchIDORUnitIDForSchoolBatch")]
        public IActionResult GetSTTBatchByBatchIDORUnitIDForSchoolBatch(Int64 UnitID, Int64 BatchID)
        {
            try
            {
                if (UnitID == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input Data Missing.", 400));

                var result = _ISchoolStep.GetSTTBatchByBatchIDORUnitIDForSchoolBatch(UnitID, BatchID);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSTTBatchByBatchIDORUnitIDForSchoolBatch");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occured: {ex.Message}", 500));
            }
        }


        [HttpGet("GetSchoolsList")]
        public ActionResult<DataSet> GetSchoolsList(int instituteId, string? filterStatus = null)
        {
            try
            {
                var result = _ISchoolStep.GetSchoolsList(instituteId, filterStatus);
                return Ok(result);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSchoolsList", instituteId.ToString());
                return StatusCode(500, new { message = "An error occurred while retrieving schools list.", error = ex.Message });
            }
        }


        [HttpGet("GetSchoolDetails")]
        public ActionResult<DataSet> GetSchoolDetails(int schoolId)
        {
            try
            {
                var result = _ISchoolStep.GetSchoolDetails(schoolId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetSchoolDetails", schoolId.ToString());

                return StatusCode(500, new
                {
                    message = "An error occurred while retrieving school details.",
                    error = ex.Message
                });
            }
        }

        
        [HttpPost("InstituteSchoolAddSchool")]
        public IActionResult InstituteSchoolAddSchool([FromBody] SchoolInputEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));

                if (entity.InstituteId <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Valid Institute ID is required.", 400));

                DataSet result = _ISchoolStep.InstituteSchoolAddSchool(entity);

                if (result != null && result.Tables.Count > 0)
                {
                    return Ok(ApiResponse<DataSet>.SuccessResponse(result, "School added successfully."));
                }
                else
                {
                    return Ok(ApiResponse<object>.SuccessResponse(null, "School added successfully."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InstituteSchoolAddSchool", entity?.InstituteId.ToString() ?? "0");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetVerifiedSchools")]
        public ActionResult<DataSet> GetVerifiedSchools(int instituteId)
        {
            try
            {
                var result = _ISchoolStep.GetVerifiedSchools(instituteId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetVerifiedSchools", instituteId.ToString());
                return StatusCode(500, new { message = "An error occurred while retrieving verified schools list.", error = ex.Message });
            }
        }

        [HttpPost("UpdateSchool")]
        public IActionResult UpdateSchool([FromBody] SchoolInputEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));
               
                int result = _ISchoolStep.UpdateSchool(entity);
                return Ok(ApiResponse<int>.SuccessResponse(result, "School updated successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateSchool");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SendSchoolForVerification")]
        public IActionResult SendSchoolForVerification(long schoolId, int modifiedBy)
        {
            try
            {
                if (schoolId <= 0 || modifiedBy <= 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Valid School ID and ModifiedBy are required.", 400));

                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

                int result = _ISchoolStep.SendSchoolForVerification(schoolId, modifiedBy, ipAddress);

                if (result > 0)
                {
                    return Ok(ApiResponse<int>.SuccessResponse(result, "School sent for verification successfully."));
                }
                else
                {
                    return Ok(ApiResponse<object>.ErrorResponse("Failed to send school for verification.", 400));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SendSchoolForVerification", schoolId.ToString());
                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("WithdrawVerificationRequest")]
        public IActionResult WithdrawVerificationRequest(long schoolId, int modifiedBy)
        {
            try
            {
                if (schoolId <= 0 || modifiedBy <= 0)
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Valid School ID and ModifiedBy are required.",
                            400
                        )
                    );

                string ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

                int result = _ISchoolStep.WithdrawVerificationRequest(
                    schoolId,
                    modifiedBy,
                    ipAddress
                );

                if (result > 0)
                {
                    return Ok(
                        ApiResponse<int>.SuccessResponse(
                            result,
                            "Verification request withdrawn successfully."
                        )
                    );
                }

                return Ok(
                    ApiResponse<object>.ErrorResponse(
                        "Failed to withdraw verification request.",
                        400
                    )
                );
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "WithdrawVerificationRequest",
                    schoolId.ToString()
                );

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500
                    )
                );
            }
        }


        //[HttpPost("GetInstituteSchoolsWiseCourse")]
        //public IActionResult GetInstituteSchoolsWiseCourse(long schoolId)
        //{
        //    try
        //    {
        //        if (schoolId <= 0)
        //        {
        //            return BadRequest(ApiResponse<object>.ErrorResponse("Input data is missing.", 400));
        //        }
        //        var result = _ISchoolStep.GetInstituteSchoolsWiseCourse(schoolId);
        //        return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Proposed course unit details retrieved successfully."));
        //    }
        //    catch (Exception ex)
        //    {
        //        CommonHelper.SaveException(ex.Message, "GetInstituteSchoolsWiseCourse");
        //        return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
        //    }
        //}




    }

}

