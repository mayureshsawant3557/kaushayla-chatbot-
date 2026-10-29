using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.DVETO;
using Portal.Business.Interface.Institute;
using Portal.Business.Worker.Utility;
using Portal.Entities.DVETO;
using Portal.Entities.ResponseBody;
using System;
using System.Collections.Generic;
using System.Data;

namespace Portal.Server.Controllers.DVETO
{
    [ApiController]
    [Route("api/[controller]")]
    public class DVETOController : ControllerBase
    {
        private readonly IDVETOBase _IDVETOBase;

        public DVETOController(IDVETOBase iDVETOBase)
        {
            _IDVETOBase = iDVETOBase ?? throw new ArgumentNullException(nameof(iDVETOBase));
        }

        [HttpGet]
        [Route("GetDVETOManagementDetails")]
        public IActionResult GetDVETOManagementDetails([FromQuery] long dvetoID)
        {
            try
            {
                var result = _IDVETOBase.GetDVETOManagementDetails(dvetoID);

                if (result != null && result.Count > 0)
                {
                    return Ok(ApiResponse<List<DVETOManagementDetailsEntity>>.SuccessResponse(
                        result,
                        "DVETO management details retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<List<DVETOManagementDetailsEntity>>.SuccessResponse(
                        new List<DVETOManagementDetailsEntity>(),
                        "No management details found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDVETOManagementDetails", dvetoID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

       // [AllowAnonymous]
        [HttpPost]
        [Route("SaveDVETOManagementDetails")]
        public IActionResult SaveDVETOManagementDetails([FromBody] DVETOManagementDetailsEntity entity)
        {
            try
            {
                if(entity==null)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Mapping data is missing.", 400));
                var result = _IDVETOBase.SaveDVETOManagementDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "DVETO management details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetDVETOInspectionCommitteeDetails")]
        public IActionResult GetDVETOInspectionCommitteeDetails([FromQuery] long instituteID)
        {
            try
            {
                var result = _IDVETOBase.GetDVETOInspectionCommitteeDetails(instituteID);

                if (result != null )
                {
                    return Ok(ApiResponse<DVETOInspectionCommitteeResponse>.SuccessResponse(
                        result,
                        "DVETO management details retrieved successfully."));
                }
                else
                {
                    return Ok(ApiResponse<DVETOInspectionCommitteeResponse>.SuccessResponse(
                        new DVETOInspectionCommitteeResponse(),
                        "No management details found."));
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetDVETOManagementDetails", instituteID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveDVETOInspectionCommittee")]
        public IActionResult SaveDVETOInspectionCommittee([FromBody] DVETOInspectionCommitteeEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(
                        "Request body is missing.",
                        400
                    ));
                }

                var isSaved = _IDVETOBase.SaveDVETOInspectionCommittee(entity);

                if (isSaved)
                {
                    return Ok(ApiResponse<object>.SuccessResponse(
                        null,
                        "DVETO Inspection Committee saved successfully."
                    ));
                }

                return Ok(ApiResponse<object>.ErrorResponse(
                    "Failed to save data. Please try again.",
                    400
                ));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveDVETOInspectionCommittee", entity?.CreateBy);

                return StatusCode(500, ApiResponse<object>.ErrorResponse(
                    "Internal server error occurred.",
                    500
                ));
            }
        }

        [HttpPost("DeleteDVETOInspectionCommittee")]
        public IActionResult deleteDVETOInspectionCommittee([FromQuery] long ID)
        {
            try
            {
                var result = _IDVETOBase.deleteDVETOInspectionCommittee(ID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("DVETO Inspection Committee not found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "DVETO Inspection Committee deleted successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "deleteDVETOInspectionCommittee", ID.ToString());
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("saveDVETOInspectionCommitteephot")]
        public IActionResult saveDVETOInspectionCommitteephot([FromQuery] int InstituteID, [FromQuery] string PhotoPath, [FromQuery] string User, [FromQuery] string IP)
        {
            try
            {
                var result = _IDVETOBase.saveDVETOInspectionCommitteephot(InstituteID, PhotoPath, User, IP);
                if (result == null)
                    {
                    return NotFound(ApiResponse<object>.ErrorResponse("Failed to save photo. Please try again.", 404));
                }
                return Ok(ApiResponse<string>.SuccessResponse(result, "DVETO Inspection Committee photo saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "saveDVETOInspectionCommitteephot", $"{InstituteID}, {User}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("DVETOGetDvetoManagementTypeByDvetoID/{DVETOID}/{managementType}")]
        public IActionResult DVETO_GetDveto_ManagementTypeByDvetoID(long DVETOID, int managementType)
        {
            try
            {
                if (DVETOID <= 0 || managementType <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid institute or management type." });

                DataTable result = _IDVETOBase.DVETO_GetDveto_ManagementTypeByDvetoID(DVETOID, managementType);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(new { Status = "Error", Message = "Data not found." });

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Data retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetDveto_ManagementTypeByDvetoID");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }
        [HttpGet("DVETOGetInstituteForDpdcFund/{OfficeID}/{InstType}/{InstituteCode}")]
        public IActionResult DVETO_GetInstituteForDpdcFund(int OfficeID, string InstType, string InstituteCode)
        {
            try
            {
                if (OfficeID <= 0 )
                    return BadRequest(new { Status = "Error", Message = "Invalid OfficeID ." });

                DataTable result = _IDVETOBase.DVETO_GetInstituteForDpdcFund(OfficeID, InstType, InstituteCode);

                if (result == null || result.Rows.Count == 0)
                    return NotFound(new { Status = "Error", Message = "Data not found." });

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Data retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "DVETO_GetInstituteForDpdcFund");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }


        [HttpGet]
        [Route("DVETO_GetCompleteFundAllocationData")]
        public IActionResult DVETO_GetCompleteFundAllocationData(
    [FromQuery] int FinancialYearID,
    [FromQuery] int DistrictID,
    [FromQuery] int MajorHeadID)
        {
            try
            {
                var result = _IDVETOBase.DVETO_GetCompleteFundAllocationData(
                    FinancialYearID,
                    DistrictID,
                    MajorHeadID);

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No data found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetCompleteFundAllocationData",
                    $"{DistrictID}, {FinancialYearID}, {MajorHeadID}");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpPost]
        [Route("DVETOSaveCompleteFundAllocationData")]
        public IActionResult DVETO_SaveCompleteFundAllocationData(
    [FromBody] DVETOFundAllocationEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Invalid request data.",
                            400));
                }

                var result = _IDVETOBase
                    .DVETO_SaveCompleteFundAllocationData(entity);

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveCompleteFundAllocationData");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        // Updated DVETO fund allocation
        [HttpGet]
        [Route("DVETO_GetFundAllocationData_2203")]
        public IActionResult DVETO_GetFundAllocationData_2203(
   [FromQuery] int FinancialYearID,
   [FromQuery] int DistrictID,
   [FromQuery] string InstituteCode
  )
        {
            try
            {
                var result = _IDVETOBase.DVETO_GetFundAllocationData_2203(
                    FinancialYearID,
                    DistrictID,
                    InstituteCode
                    );

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No data found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetCompleteFundAllocationData",
                    $"{DistrictID}, {FinancialYearID}");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpPost]
        [Route("DVETO_SaveFundAllocationData_2203")]
        public IActionResult DVETO_SaveFundAllocationData_2203(
   [FromBody] SaveFundAllocationRequest entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Invalid request data.",
                            400));
                }

                var result = _IDVETOBase
                    .DVETO_SaveFundAllocationData_2203(entity);

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveFundAllocationData_2203");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpGet]
        [Route("DVETO_GetFundAllocationMasters_2203")]
        public IActionResult DVETO_GetFundAllocationMasters_2203(
   
  )
        {
            try
            {
                var result = _IDVETOBase.DVETO_GetFundAllocationMasters_2203(
                   
                    );

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No data found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetFundAllocationMasters_2203"
                   );

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        //2230
        [HttpGet]
        [Route("DVETO_GetFundAllocationMasters_2230")]
        public IActionResult DVETO_GetFundAllocationMasters_2230(
   
  )
        {
            try
            {
                var result = _IDVETOBase.DVETO_GetFundAllocationMasters_2230(
                   
                    );

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No data found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetFundAllocationMasters_2230"
                   );

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }
        [HttpGet]
        [Route("DVETO_GetFundAllocationData_2230")]
        public IActionResult DVETO_GetFundAllocationData_2230(
   [FromQuery] int FinancialYearID,
   [FromQuery] int DistrictID,
    [FromQuery] string InstituteCode
  )
        {
            try
            {
                var result = _IDVETOBase.DVETO_GetFundAllocationData_2230(
                    FinancialYearID,
                    DistrictID,
                    InstituteCode

                    );

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No data found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_GetFundAllocationData_2230",
                    $"{DistrictID}, {FinancialYearID}");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpPost]
        [Route("DVETO_SaveFundAllocationData_2230")]
        public IActionResult DVETO_SaveFundAllocationData_2230(
  [FromBody] SaveFundAllocationRequest entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Invalid request data.",
                            400));
                }

                var result = _IDVETOBase
                    .DVETO_SaveFundAllocationData_2230(entity);

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Fund allocation data saved successfully.",
                        200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "DVETO_SaveFundAllocationData_2230");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }
        [HttpGet]
        [Route("GetHeadDocuments_2203")]
        public IActionResult GetHeadDocuments_2203(
        [FromQuery] int OfficeID,
        [FromQuery] int FinancialYearID)
        {
            try
            {
                var result = _IDVETOBase.GetHeadDocuments_2203(
                    OfficeID,
                    FinancialYearID);

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No head documents found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Head documents fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetHeadDocuments_2203",
                    $"{OfficeID},{FinancialYearID}");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpPut]
        [Route("Save_HeadDocuments_2203")]
        public IActionResult Save_HeadDocuments_2203(
    [FromBody] SaveHeadDocumentEntity entity)
        {
            try
            {
                var result = _IDVETOBase.Save_HeadDocuments_2203(entity);

                if (result == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Failed to save head document.",
                            400));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Head document saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "Save_HeadDocuments_2203",
                    entity?.CreatedBy);

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpGet]
        [Route("GetHeadDocuments_2230")]
        public IActionResult GetHeadDocuments_2230(
      [FromQuery] int OfficeID,
      [FromQuery] int FinancialYearID)
        {
            try
            {
                var result = _IDVETOBase.GetHeadDocuments_2230(
                    OfficeID,
                    FinancialYearID);

                if (result == null)
                {
                    return NotFound(
                        ApiResponse<object>.ErrorResponse(
                            "No head documents found.",
                            404));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Head documents fetched successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "GetHeadDocuments_2230",
                    $"{OfficeID},{FinancialYearID}");

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }

        [HttpPut]
        [Route("Save_HeadDocuments_2230")]
        public IActionResult Save_HeadDocuments_2230(
    [FromBody] SaveHeadDocumentEntity entity)
        {
            try
            {
                var result = _IDVETOBase.Save_HeadDocuments_2230(entity);

                if (result == null)
                {
                    return BadRequest(
                        ApiResponse<object>.ErrorResponse(
                            "Failed to save head document.",
                            400));
                }

                return Ok(
                    ApiResponse<object>.SuccessResponse(
                        result,
                        "Head document saved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(
                    ex.Message,
                    "Save_HeadDocuments_2230",
                    entity?.CreatedBy);

                return StatusCode(
                    500,
                    ApiResponse<object>.ErrorResponse(
                        $"An error occurred: {ex.Message}",
                        500));
            }
        }
        [HttpGet("GetStateFundOfficeUsers")]
        public IActionResult StateFund_GetOfficeUsers()
        {
            try
            {
                DataSet result = _IDVETOBase.StateFund_GetOfficeUsers();

                if (result == null || result.Tables.Count == 0)
                {
                    return NotFound(new
                    {
                        Status = "Error",
                        Message = "Data not found."
                    });
                }

                return Ok(new
                {
                    Status = "Success",
                    StatusCode = 200,
                    Message = "Data retrieved successfully.",
                    Data = result
                });
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "StateFund_GetOfficeUsers");

                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }

    }
}
    