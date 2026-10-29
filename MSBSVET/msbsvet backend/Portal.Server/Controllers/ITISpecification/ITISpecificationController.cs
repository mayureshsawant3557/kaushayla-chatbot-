using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Institute;
using Portal.Business.Interface.ITISpecification;
using Portal.Business.Worker.Base;
using Portal.Business.Worker.Utility;
using Portal.Entities.ITISpecification;
using Portal.Entities.ResponseBody;
using System.Data;
using System.Reflection.Metadata.Ecma335;

namespace Portal.Server.Controllers.ITISpecification
{
    //[ApiKeyAuth]
    [Route("api/[controller]")]
    [ApiController]
    public class ITISpecificationController : ControllerBase
    {
        private readonly IITISpecificationBase _base;
        public ITISpecificationController(IITISpecificationBase iIITISpecificationBase)
        {
            _base = iIITISpecificationBase ?? throw new ArgumentNullException(nameof(iIITISpecificationBase));
        }


        [HttpGet]
        [Route("GetMasterGroup")]
        public IActionResult GetMasterGroup()
        {
            try
            {
                var result = _base.GetMasterGroup();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No groups found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master group list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterSector")]
        public IActionResult GetMasterSector()
        {
            try
            {
                var result = _base.GetMasterSector();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectors found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master sector list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterTrade")]
        public IActionResult GetMasterTrade()
        {
            try
            {
                var result = _base.GetMasterTrade();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No trades found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master trade list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterCategory")]
        public IActionResult GetMasterCategory()
        {
            try
            {
                var result = _base.GetMasterCategory();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No categories found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master category list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMasterItem")]
        public IActionResult GetMasterItem()
        {
            try
            {
                var result = _base.GetMasterItem();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No items found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master item list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetTradeWiseItems")]
        public IActionResult GetTradeWiseItems(long tradeId)
        {
            try
            {

                var result = _base.GetTradeWiseItems(tradeId);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No trade wise items found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Trade wise items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetGroupWiseItems")]
        public IActionResult GetGroupWiseItems(int sectorId, int groupId, int categoryId = -1, int itemId = -1)
        {
            try
            {
                var result = _base.GetGroupWiseItems(sectorId, groupId, categoryId, itemId);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No group wise items found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Group wise items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetSectorWiseItems")]
        public IActionResult GetSectorWiseItems(int sectorId, int categoryId = -1, int itemId = -1)
        {
            try
            {
                var result = _base.GetSectorWiseItems(sectorId, categoryId, itemId);
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No sector wise items found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "Sector wise items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetAllItems")]
        public IActionResult GetAllItems()
        {
            try
            {
                var result = _base.GetAllItems();
                if (result == null || !result.Any())
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No items found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(result, "All items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveRequirements")]
        public IActionResult SaveRequirements([FromBody] SaveRequirementRequest request)
        {
            try
            {
                // Get client IP address
                request.IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _base.SaveRequirements(request);

                if (result.Status == "Success")
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SubmitRequirements")]
        public IActionResult SubmitRequirements([FromBody] SaveRequirementRequest request)
        {
            try
            {
                // Get client IP address
                request.IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _base.SubmitRequirements(request);

                if (result.Status == "Success")
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetUserRequirements")]
        public IActionResult GetUserRequirements(long userId, string financialYear)
        {
            try
            {
                var result = _base.GetUserRequirements(userId, financialYear);
                return Ok(ApiResponse<object>.SuccessResponse(result, "User requirements retrieved successfully."));
            }
            catch (Exception ex)
            {
                // Log the full exception for debugging
                Console.WriteLine($"GetUserRequirements Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpDelete]
        [Route("DeleteRequirements")]
        public IActionResult DeleteRequirements([FromBody] DeleteRequirementRequest request)
        {
            try
            {
                // Get client IP address
                request.IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _base.DeleteRequirements(request);

                if (result.Status == "Success")
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetProposedTotals")]
        public IActionResult GetProposedTotals(long userId, string financialYear)
        {
            try
            {
                var result = _base.GetProposedTotals(userId, financialYear);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Proposed totals retrieved successfully."));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetProposedTotals Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SaveSingleRequirement")]
        public IActionResult SaveSingleRequirement([FromBody] SingleRequirementRequest request)
        {
            try
            {
                // Get client IP address
                request.IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString();

                var result = _base.SaveSingleRequirement(request);

                if (result.Status == "Success")
                {
                    return Ok(result);
                }
                else
                {
                    return BadRequest(result);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetSectorsWithTrades")]
        public IActionResult GetSectorsWithTrades()
        {
            try
            {
                var sectors = _base.GetSectorsWithTrades();
                return Ok(ApiResponse<List<SectorEntity>>.SuccessResponse(sectors, "Sectors with trades retrieved successfully."));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"GetSectorsWithTrades Error: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        //pppfund


        [HttpGet]
        [Route("GetFundByInstitute")]
        public IActionResult GetFundData([FromQuery] string InstituteID)
        {
            try
            {


                var result = _base.GetFundData(InstituteID);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No fund data found for the given Institute ID.",
                        404));
                }

                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Fund data retrieved successfully."));
            }
            catch (FormatException)
            {
                return BadRequest(ApiResponse<object>.ErrorResponse(
                    "Please correct the following validation errors and try again. For 'InstituteID': Value must be an integer.",
                    400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetInterestByInstitute")]
        public IActionResult GetInterestData(string InstituteID)
        {
            try
            {
                var result = _base.GetInterestData(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No interest data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Interest data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveInterest")]
        public IActionResult SaveInterestData([FromBody] InterestEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid interest data.", 400));
                }

                var result = _base.SaveInterestData(entity);

                if (result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Interest data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }





        [HttpGet]
        [Route("GetRevenueByInstitute")]
        public IActionResult GetRevenueData(string InstituteID)
        {
            try
            {
                var result = _base.GetRevenueData(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No revenue data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Revenue data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveRevenue")]
        public IActionResult SaveRevenueData([FromBody] RevenueEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid revenue data.", 400));
                }

                var result = _base.SaveRevenueData(entity);

                if (result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Revenue data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetExpenditureByInstitute")]
        public IActionResult GetExpenditureData(string InstituteID)
        {
            try
            {
                var result = _base.GetExpenditureData(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No expenditure data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Expenditure data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveExpenditure")]
        public IActionResult SaveExpenditureData([FromBody] ExpenditureEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid expenditure data.", 400));
                }

                var result = _base.SaveExpenditureData(entity);

                if (result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Expenditure data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpGet]
        [Route("GetRepaymentByInstitute")]
        public IActionResult GetRepaymentData(string InstituteID)
        {
            try
            {
                var result = _base.GetRepaymentData(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No repayment data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Repayment data retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveRepayment")]
        public IActionResult SaveRepaymentData([FromBody] RepaymentEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid repayment data.", 400));
                }

                var result = _base.SaveRepaymentData(entity);

                if (result.Contains("Error") || result.Contains("not been saved"))
                {
                    return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Repayment data saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



        [HttpGet]
        [Route("GetPPPFundStatusByInstitute")]
        public IActionResult GetPPPFundStatus(string InstituteID)
        {
            try
            {
                var result = _base.GetPPPFundStatus(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No PPP fund status data found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "PPP fund status retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("UpdateRequirementStatus")]
        public IActionResult UpdateRequirementStatus([FromBody] UpdateStatusRequest request)
        {
            try
            {
                var result = _base.UpdateRequirementStatus(
                    request.UserID,
                    request.FinancialYear,
                    request.NewStatus,
                    request.ModifiedBy,
                    request.Remarks,
                    request.ApprovedBy
                );

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Failed to update requirement status.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Requirement status updated successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetUsersByStatus")]
        public IActionResult GetUsersByStatus(string status = null, string financialYear = null)
        {
            try
            {
                var result = _base.GetUsersByStatus(status, financialYear);
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No users found with the given status.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Users retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetStatusSummary")]
        public IActionResult GetStatusSummary(string financialYear = null)
        {
            try
            {
                var result = _base.GetStatusSummary(financialYear);
                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No status summary found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Status summary retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("IsRequirementSubmitted")]
        public IActionResult IsRequirementSubmitted(long userId, string financialYear)
        {
            try
            {
                var result = _base.IsRequirementSubmitted(userId, financialYear);

                var responseData = new
                {
                    IsSubmitted = result,
                    UserId = userId,
                    FinancialYear = financialYear
                };

                return Ok(ApiResponse<object>.SuccessResponse(responseData,
                    result ? "Requirements are submitted." : "Requirements are not submitted."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }




        [HttpGet]
        [Route("GetFinancialPeriodsByInstitute")]
        public IActionResult GetFinancialPeriods(string InstituteID)
        {
            try
            {
                var result = _base.GetFinancialPeriods(InstituteID);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No financial periods found for the given Institute ID.", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(result, "Financial periods retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        

        //updated pppfund module 

        [HttpGet]
        [Route("GetFinancialDataForPppFund")]
        public IActionResult GetFinancialDataForPppFund(int InstituID)
        {
            try
            {
                var res = _base.GetFinancialDataForPppFund(InstituID);
                if(res == null || res.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No financial Data found for the given InstituteID", 404));
                }
                return Ok(ApiResponse<DataTable>.SuccessResponse(res, "data found"));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"an error occurred:{ex.Message}",500));

            }
        
        }


        [HttpPost]
        [Route("SaveFinancialDataForPppFund")]
        public IActionResult SaveFinancialDataForPppFund(
                             [FromBody] List<FinancialDataForPppFundEntity> entities)
        {
            try
            {
                if (entities == null || entities.Count == 0)
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid Financial Fund data.", 400));

                var ids = new List<string>();

                foreach (var entity in entities)
                {
                    var result = _base.SaveFinancialDataForPppFund(entity);

                    if (result.Contains("Error") || result.Contains("not been save"))
                        return BadRequest(ApiResponse<object>.ErrorResponse(result, 400));

                    ids.Add(result);
                }

                return Ok(ApiResponse<List<string>>.SuccessResponse(
                    ids,
                    "Financial Data Saved successfully."
                ));
            }
            catch (Exception ex)
            {
                return StatusCode(500,
                    ApiResponse<object>.ErrorResponse($"an error occured :{ex.Message}", 500));
            }
        }

        [HttpGet("GetInstituteAndManagementMobile/{instituteId}/{managementType}")]
        public IActionResult GetInstituteAndManagementMobile(long instituteId, int managementType)
        {
            try
            {
                if (instituteId <= 0 || managementType <= 0)
                    return BadRequest(new { Status = "Error", Message = "Invalid institute or management type." });

                DataTable result = _base.GetInstituteAndManagementMobile(instituteId, managementType);

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
                CommonHelper.SaveException(ex.Message, "GetInstituteAndManagementMobile");
                return StatusCode(500, new
                {
                    Status = "Error",
                    StatusCode = 500,
                    Message = "An error occurred while retrieving data.",
                    Error = ex.Message
                });
            }
        }

        //
        [HttpPost]
        [Route("UpdateITIRequirementsStatusToDraft")]
        public IActionResult UpdateITIRequirementsStatusToDraft(int collegeID)
        {
            if (collegeID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid CollegeID.", 400));

            try
            {
                var result = _base.UpdateITIRequirementsStatusToDraft(collegeID);

                
                if (result.Contains("not found") || result.Contains("No data have submitted"))
                {
                    return Ok(ApiResponse<string>.ErrorResponse(result, 404));
                }
                else if (result.Contains("Error:"))
                {
                    return StatusCode(500, ApiResponse<string>.ErrorResponse(result, 500));
                }

                return Ok(ApiResponse<string>.SuccessResponse(result, "Operation completed successfully.", 200));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        //available  fund for ITI requirement 
        [HttpGet]
        [Route("GetAvailableFundForRequirements")]
        public IActionResult GetAvailableFundForRequirements(int FinancialYearID, int RegionID, int DistrictID, int TalukaID, int CollegeID)
        {
            try
            {
                var result = _base.GetAvailableFundForRequirements(
                    FinancialYearID,
                    RegionID,
                    DistrictID,
                    TalukaID,
                    CollegeID
                );

                   

                var serializableData = BaseWorker.ConvertDataTableToList(result);

                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Failed to get available fund for requirements.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Available fund for requirements retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



    }


}

