using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Base;
using Portal.Business.Interface.Master;
using Portal.Business.Worker.Utility;
using Portal.Entities.Master;
using Portal.Entities.ResponseBody;
using System;
using static Portal.Entities.Master.MasterBatchEntity;  



namespace Portal.Server.Controllers.Master
{
   
    [ApiController]
    [Route("api/[controller]")]
    public class MasterController : ControllerBase
    {
        private readonly IMaster _master;

        public MasterController(IMaster master)
        {
            _master = master;
        }

        #region Master List

        [HttpGet("GetMasterList")]
        public IActionResult GetMasterList()
        {
            try
            {
                var result = _master.GetMasterList();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No masters found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region State Endpoints
        [HttpGet("GetMasterState")]
        public IActionResult GetMasterState()
        {
            try
            {
                var result = _master.GetMasterState();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No states found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master state list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("InsertMasterState")]
        public ActionResult<ApiResponse<string>> InsertMasterState(
    [FromBody] MasterStateEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State data cannot be null.", 400));

            if (entity.StateID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid State ID is required.", 400));

            if (string.IsNullOrEmpty(entity.State))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State name is required.", 400));

            if (entity.CountryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Country ID is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.InsertMasterState(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to insert state.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "State inserted successfully.",
                        "State inserted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertMasterState");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterState")]
        public ActionResult<ApiResponse<string>> UpdateMasterState(
    [FromBody] MasterStateEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State data cannot be null.", 400));

            if (entity.StateID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.State))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State name is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.UpdateMasterState(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update state.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "State updated successfully.",
                        "State updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterState");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterState/{StateID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterState(int StateID)
        {
            if (StateID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("State ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterState(StateID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"State with ID {StateID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "State soft deleted successfully.",
                        "State soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterState");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        #endregion

        #region District Endpoints
        [HttpGet("GetMasterDistrictTable")]
        public IActionResult GetMasterDistrict()
        {
            try
            {
                var result = _master.GetMasterDistricttable();
                // 404 mat karo agar empty ho — 200 with empty list do
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master district list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterDistrict")]
        public IActionResult InsertMasterDistrict([FromBody] MasterDistrictEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("District data is required.", 400));
                if (entity.DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid District ID is required.", 400));
                if (string.IsNullOrEmpty(entity.District))
                    return BadRequest(ApiResponse<string>.ErrorResponse("District name is required.", 400));
                if (entity.StateID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid State ID is required.", 400));

                bool result = _master.InsertMasterDistrict(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "District inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert district.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterDistrict")]
        public IActionResult UpdateMasterDistrict([FromBody] MasterDistrictEntity entity)
        {
            try
            {
                if (entity == null || entity.DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid district data.", 400));
                if (string.IsNullOrEmpty(entity.District))
                    return BadRequest(ApiResponse<string>.ErrorResponse("District name is required.", 400));
                // DistrictMarathi optional hai — koi check nahi

                bool result = _master.UpdateMasterDistrict(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "District updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update district.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterDistrict/{DistrictID}")]
        public IActionResult SoftDeleteMasterDistrict(int DistrictID)
        {
            try
            {
                if (DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid District ID.", 400));

                bool result = _master.SoftDeleteMasterDistrict(DistrictID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "District soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"District with ID {DistrictID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region Taluka Endpoints
        [HttpGet("GetMasterTalukaTable")]
        public IActionResult GetMasterTaluka()
        {
            try
            {
                var result = _master.GetMasterTalukatable();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master taluka list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterTaluka")]
        public IActionResult InsertMasterTaluka([FromBody] MasterTalukaEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Taluka data is required.", 400));
                if (entity.TalukaID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Taluka ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Taluka))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Taluka name is required.", 400));
                if (entity.DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid District ID is required.", 400));

                bool result = _master.InsertMasterTaluka(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Taluka inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert taluka.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTaluka")]
        public IActionResult UpdateMasterTaluka([FromBody] MasterTalukaEntity entity)
        {
            try
            {
                if (entity == null || entity.TalukaID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid taluka data.", 400));
                if (string.IsNullOrEmpty(entity.Taluka))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Taluka name is required.", 400));

                bool result = _master.UpdateMasterTaluka(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Taluka updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update taluka.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTaluka/{TalukaID}")]
        public IActionResult SoftDeleteMasterTaluka(int TalukaID)
        {
            try
            {
                if (TalukaID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Taluka ID.", 400));

                bool result = _master.SoftDeleteMasterTaluka(TalukaID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Taluka soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Taluka with ID {TalukaID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region City Endpoints

        [HttpGet("GetMasterCity")]
        public IActionResult GetMasterCity([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, [FromQuery] string search = null, [FromQuery] bool? isActive = null, [FromQuery] bool? isRural = null)
        {
            try
            {
                var result = _master.GetMasterCity(pageNumber, pageSize, search, isActive, isRural);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master city list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpGet("GetMasterCityStats")]
        public IActionResult GetMasterCityStats()
        {
            try
            {
                var result = _master.GetMasterCityStats();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master city stats retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterCity")]
        public IActionResult InsertMasterCity([FromBody] MasterCityEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("City data is required.", 400));
                if (entity.CityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid City ID is required.", 400));
                if (string.IsNullOrEmpty(entity.City))
                    return BadRequest(ApiResponse<string>.ErrorResponse("City name is required.", 400));
                if (entity.TalukaID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Taluka ID is required.", 400));

                bool result = _master.InsertMasterCity(entity);
                if (result)                                                          // ✅ ek hi baar
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "City inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert city.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterCity")]
        public IActionResult UpdateMasterCity([FromBody] MasterCityEntity entity)
        {
            try
            {
                if (entity == null || entity.CityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid city data.", 400));

                if (string.IsNullOrEmpty(entity.City))
                    return BadRequest(ApiResponse<string>.ErrorResponse("City name is required.", 400));

                if (entity.TalukaID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Taluka ID is required.", 400));

                bool result = _master.UpdateMasterCity(entity);

                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "City updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update city.", 400));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterCity");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterCity/{CityID}")]
        public IActionResult SoftDeleteMasterCity(int CityID)
        {
            try
            {
                if (CityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid City ID.", 400));

                bool result = _master.SoftDeleteMasterCity(CityID);

                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "City soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"City with ID {CityID} not found.", 404));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCity");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region Region Endpoints
        [HttpGet("GetMasterRegion")]
        public IActionResult GetMasterRegion()
        {
            try
            {
                var result = _master.GetMasterRegion();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master region list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterRegion")]
        public IActionResult InsertMasterRegion([FromBody] MasterRegionEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Region data is required.", 400));
                if (string.IsNullOrEmpty(entity.Region))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Region name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterRegion(entity); // entity.RegionID ab yahin se update ho jayega

                if (result)
                    return Ok(ApiResponse<object>.SuccessResponse(new { entity.RegionID }, "Region inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert region.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost]
        [Route("UpdateMasterRegion")]
        public ActionResult<ApiResponse<string>> UpdateMasterRegion([FromBody] MasterRegionEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Region data cannot be null.", 400));

            if (entity.RegionID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Region ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Region))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Region name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterRegion(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update region.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Region updated successfully.",
                        "Region updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterRegion");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterRegion/{RegionID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterRegion(int RegionID)
        {
            if (RegionID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Region ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterRegion(RegionID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Region with ID {RegionID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Region soft deleted successfully.",
                        "Region soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterRegion");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        #endregion

        #region Pincode Endpoints
        [HttpGet("GetMasterPincode")]
        public IActionResult GetMasterPincode([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, [FromQuery] string search = null)
        {
            try
            {
                var result = _master.GetMasterPincode(pageNumber, pageSize, search);
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master pincode list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetMasterPincodeStats")]
        public IActionResult GetMasterPincodeStats()
        {
            try
            {
                var result = _master.GetMasterPincodeStats();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Pincode stats retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterPincode")]
        public IActionResult InsertMasterPincode([FromBody] MasterPincodeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Pincode data is required.", 400));
                if (string.IsNullOrEmpty(entity.Pincode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Pincode is required.", 400));
                if (entity.CityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid City ID is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterPincode(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Pincode inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert pincode.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterPincode")]
        public ActionResult<ApiResponse<string>> UpdateMasterPincode([FromBody] MasterPincodeEntity entity)
        {
            if (entity == null || entity.PincodeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid pincode data.", 400));

            if (string.IsNullOrEmpty(entity.Pincode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Pincode is required.", 400));

            if (entity.CityID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid City ID is required.", 400));

            try
            {
                bool result = _master.UpdateMasterPincode(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update pincode.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Pincode updated successfully.",
                        "Pincode updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterPincode");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterPincode/{PincodeID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterPincode(int PincodeID)
        {
            if (PincodeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Pincode ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterPincode(PincodeID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Pincode with ID {PincodeID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Pincode soft deleted successfully.",
                        "Pincode soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPincode");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        #endregion

        #region caste

        [HttpPost("InsertMasterCaste")]
        public IActionResult InsertMasterCaste([FromBody] MasterCasteEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Caste data is required.", 400));
                if (string.IsNullOrWhiteSpace(entity.Caste))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Caste name is required.", 400));
                if (entity.CategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Category ID is required.", 400));

                bool result = _master.InsertMasterCaste(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Caste inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert caste. Duplicate may exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterCaste")]
        public IActionResult UpdateMasterCaste([FromBody] MasterCasteEntity entity)
        {
            try
            {
                if (entity == null || entity.CasteID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid caste data.", 400));
                if (string.IsNullOrWhiteSpace(entity.Caste))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Caste name is required.", 400));
                if (entity.CategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Category ID is required.", 400));

                bool result = _master.UpdateMasterCaste(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Caste updated successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Caste with ID {entity.CasteID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterCaste/{CasteID}")]
        public IActionResult SoftDeleteMasterCaste(int CasteID)
        {
            try
            {
                if (CasteID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Caste ID.", 400));

                var (success, message) = _master.SoftDeleteMasterCaste(CasteID);

                if (success)
                    return Ok(ApiResponse<string>.SuccessResponse(message, message, 200));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse(message, 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetAllMasterCaste")]
        public IActionResult GetAllMasterCaste()
        {
            try
            {
                var result = _master.GetAllMasterCaste();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master caste list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region Category Endpoints

        [HttpGet("GetMasterCasteCategory")]
        public IActionResult GetMasterCasteCategory()
        {
            try
            {
                var result = _master.GetMasterCasteCategory();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Master category list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterCategory")]
        public IActionResult InsertMasterCategory([FromBody] MasterCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category data is required.", 400));
                if (string.IsNullOrWhiteSpace(entity.Category))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category name is required.", 400));
                if (string.IsNullOrWhiteSpace(entity.CategoryCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category code is required.", 400));

                bool result = _master.InsertMasterCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterCategory([FromBody] MasterCategoryEntity entity)
        {
            if (entity == null || entity.CategoryID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid category data.", 400));
            if (string.IsNullOrWhiteSpace(entity.Category))
                return BadRequest(ApiResponse<string>.ErrorResponse("Category name is required.", 400));
            if (string.IsNullOrWhiteSpace(entity.CategoryCode))
                return BadRequest(ApiResponse<string>.ErrorResponse("Category code is required.", 400));

            try
            {
                bool result = _master.UpdateMasterCategory(entity);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Category with ID {entity.CategoryID} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Category updated successfully.",
                    "Category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterCategory/{CategoryID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterCategory(int CategoryID)
        {
            if (CategoryID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Category ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterCategory(CategoryID);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Category with ID {CategoryID} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Category soft deleted successfully.",
                    "Category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Disability Endpoints

        [HttpGet("GetAllDisabilities")]
        public IActionResult GetAllDisabilities()
        {
            try
            {
                var result = _master.GetAllDisabilities();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No disabilities found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Disability list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertDisability")]
        public IActionResult InsertDisability([FromBody] MasterDisabilityEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Disability data is required.", 400));
                if (string.IsNullOrWhiteSpace(entity.Disability))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Disability name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertDisability(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Disability inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert disability.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateDisability")]
        public IActionResult UpdateDisability([FromBody] MasterDisabilityEntity entity)
        {
            try
            {
                if (entity == null || entity.DisabilityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid disability data.", 400));
                if (string.IsNullOrWhiteSpace(entity.Disability))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Disability name is required.", 400));

                bool result = _master.UpdateDisability(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Disability updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update disability.", 400));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateDisability");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteDisability/{DisabilityID}")]
        public IActionResult SoftDeleteDisability(int DisabilityID)
        {
            try
            {
                if (DisabilityID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Disability ID.", 400));

                bool result = _master.SoftDeleteDisability(DisabilityID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Disability soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Disability with ID {DisabilityID} not found.", 404));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteDisability");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region AcademicYear Endpoints

        [HttpGet("GetAllAcademicYears")]
        public IActionResult GetAllAcademicYears()
        {
            try
            {
                var result = _master.GetAllAcademicYears();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No academic years found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Academic year list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertAcademicYear")]
        public IActionResult InsertAcademicYear([FromBody] MasterAcademicYearEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Academic year data is required.", 400));
                if (string.IsNullOrEmpty(entity.YearName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Year name is required.", 400));
                if (string.IsNullOrEmpty(entity.YearDisplayName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Year display name is required.", 400));

                bool result = _master.InsertAcademicYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Academic year inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert academic year. It may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateAcademicYear")]
        public IActionResult UpdateAcademicYear([FromBody] MasterAcademicYearEntity entity)
        {
            try
            {
                if (entity == null || entity.YearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid academic year data.", 400));
                if (string.IsNullOrEmpty(entity.YearName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Year name is required.", 400));
                if (string.IsNullOrEmpty(entity.YearDisplayName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Year display name is required.", 400));

                bool result = _master.UpdateAcademicYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Academic year updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update academic year.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteAcademicYear/{YearId}")]
        public IActionResult SoftDeleteAcademicYear(int YearId)
        {
            try
            {
                if (YearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Year ID.", 400));

                bool result = _master.SoftDeleteAcademicYear(YearId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Academic year soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Academic year with ID {YearId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region Activity Status Endpoints

            [HttpGet("GetAllActivityStatuses")]
    public IActionResult GetAllActivityStatuses()
    {
        try
        {
            var result = _master.GetAllActivityStatuses();
            if (result == null || result.Count == 0)
                return NotFound(ApiResponse<object>.ErrorResponse("No activity statuses found.", 404));
            return Ok(ApiResponse<object>.SuccessResponse(result, "Activity status list retrieved successfully."));
        }
        catch (Exception ex)
        {
            return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
        }
    }

            [HttpPost("InsertActivityStatus")]
            public IActionResult InsertActivityStatus([FromBody] MasterActivityStatusEntity entity)
            {
                try
                {
                    if (entity == null)
                        return BadRequest(ApiResponse<string>.ErrorResponse("Activity data is required.", 400));
                    if (string.IsNullOrWhiteSpace(entity.ActivityName))
                        return BadRequest(ApiResponse<string>.ErrorResponse("Activity Name is required.", 400));
                    if (entity.ActivityStartDateTime.HasValue && entity.ActivityEndDateTime.HasValue
                        && entity.ActivityEndDateTime < entity.ActivityStartDateTime)
                        return BadRequest(ApiResponse<string>.ErrorResponse("End Date must be after Start Date.", 400));

                    entity.IsActive = true;

             
                    entity.ModifiedBy = User?.Identity?.Name ?? "System";
                    entity.ModifiedByIPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

                    bool result = _master.InsertActivityStatus(entity);
                    if (result)
                        return Ok(ApiResponse<bool>.SuccessResponse(result, "Activity status inserted successfully."));
                    else
                        return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert activity status.", 400));
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
                }
            }

        [HttpPost("UpdateActivityStatus")]
        public IActionResult UpdateActivityStatus([FromBody] MasterActivityStatusEntity entity)
        {
            try
            {
                if (entity == null || entity.SeqNo <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid activity data.", 400));
                if (string.IsNullOrWhiteSpace(entity.ActivityName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Activity Name is required.", 400));
                if (entity.ActivityStartDateTime.HasValue && entity.ActivityEndDateTime.HasValue
                    && entity.ActivityEndDateTime < entity.ActivityStartDateTime)
                    return BadRequest(ApiResponse<string>.ErrorResponse("End Date must be after Start Date.", 400));

                entity.ModifiedBy = User?.Identity?.Name ?? "System";
                entity.ModifiedByIPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

                bool result = _master.UpdateActivityStatus(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Activity status updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update activity status.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteActivityStatus/{SeqNo}")]
        public IActionResult SoftDeleteActivityStatus(int SeqNo)
        {
            try
            {
                if (SeqNo <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Seq No.", 400));

                string modifiedBy = User?.Identity?.Name ?? "System";
                string modifiedByIp = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";

                bool result = _master.SoftDeleteActivityStatus(SeqNo, modifiedBy, modifiedByIp);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Activity status deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Activity status with SeqNo {SeqNo} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region AffiliationPages Endpoints


        [HttpGet("GetMasterAffiliationPages")]
            public IActionResult GetMasterAffiliationPages()
            {
                try
                {
                    var result = _master.GetMasterAffiliationPages();
                    if (result == null || result.Count == 0)
                        return NotFound(ApiResponse<object>.ErrorResponse("No affiliation pages found.", 404));

                    return Ok(ApiResponse<object>.SuccessResponse(result, "Affiliation pages retrieved successfully."));
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
                }
            }

           
            [HttpPost("InsertMasterAffiliationPage")]
            public IActionResult InsertMasterAffiliationPage([FromBody] MasterAffiliationPageEntity entity)
            {
                try
                {
                    if (entity == null)
                        return BadRequest(ApiResponse<string>.ErrorResponse("Page data is required.", 400));
                    if (entity.PageId <= 0)
                        return BadRequest(ApiResponse<string>.ErrorResponse("Valid Page ID is required.", 400));
                    if (string.IsNullOrWhiteSpace(entity.PageName))
                        return BadRequest(ApiResponse<string>.ErrorResponse("Page name is required.", 400));

                    entity.IsActive = true;

                    bool result = _master.InsertMasterAffiliationPage(entity);
                    if (result)
                        return Ok(ApiResponse<bool>.SuccessResponse(result, "Affiliation page inserted successfully."));

                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert affiliation page.", 400));
                }
                catch (Exception ex)
                {
                    return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
                }
            }

        [HttpPost("UpdateMasterAffiliationPage")]
        public IActionResult UpdateMasterAffiliationPage([FromBody] MasterAffiliationPageEntity entity)
        {
            try
            {
                if (entity == null || entity.PageId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid page data.", 400));
                if (string.IsNullOrWhiteSpace(entity.PageName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Page name is required.", 400));

                bool result = _master.UpdateMasterAffiliationPage(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Affiliation page updated successfully."));

                return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update affiliation page.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

       
        [HttpPost("SoftDeleteMasterAffiliationPage/{PageId}")]
        public IActionResult SoftDeleteMasterAffiliationPage(int PageId)
        {
            try
            {
                if (PageId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Page ID.", 400));

                bool result = _master.SoftDeleteMasterAffiliationPage(PageId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Affiliation page soft deleted successfully."));

                return NotFound(ApiResponse<string>.ErrorResponse($"Page with ID {PageId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region ApplicationFormLink Endpoints

        [HttpGet("GetMasterApplicationFormLinks")]
        public IActionResult GetMasterApplicationFormLinks()
        {
            try
            {
                var result = _master.GetMasterApplicationFormLinks();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No application form links found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Application form links retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterApplicationFormLink")]
        public IActionResult InsertMasterApplicationFormLink([FromBody] MasterApplicationFormLinkEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Link data is required.", 400));
                if (entity.LinkID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Link ID is required.", 400));
                if (string.IsNullOrEmpty(entity.LinkType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Link Type is required.", 400));
                if (string.IsNullOrEmpty(entity.LinkName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Link Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterApplicationFormLink(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Application form link inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert link. LinkID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterApplicationFormLink")]  
        public IActionResult UpdateMasterApplicationFormLink([FromBody] MasterApplicationFormLinkEntity entity)
        {
            try
            {
                if (entity == null || entity.LinkID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid link data.", 400));
                if (string.IsNullOrEmpty(entity.LinkType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Link Type is required.", 400));
                if (string.IsNullOrEmpty(entity.LinkName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Link Name is required.", 400));

                bool result = _master.UpdateMasterApplicationFormLink(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Application form link updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update link.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterApplicationFormLink/{LinkID}")]   
        public IActionResult SoftDeleteMasterApplicationFormLink(int LinkID)
        {
            try
            {
                if (LinkID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Link ID.", 400));

                bool result = _master.SoftDeleteMasterApplicationFormLink(LinkID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Application form link soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Link with ID {LinkID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region ApprovalGroup Endpoints

        [HttpGet("GetMasterApprovalGroups")]
        public IActionResult GetMaster_ApprovalGroups()
        {
            try
            {
                var result = _master.GetMaster_ApprovalGroups();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No approval groups found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Approval groups retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterApprovalGroup")]
        public IActionResult InsertMasterApprovalGroup([FromBody] Master_ApprovalGroupEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval group data is required.", 400));
                if (string.IsNullOrEmpty(entity.ApprovalGroupName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval Group Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterApprovalGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Approval group inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert approval group.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

   
        [HttpPost("UpdateMasterApprovalGroup")]
        public IActionResult UpdateMasterApprovalGroup([FromBody] Master_ApprovalGroupEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid approval group data.", 400));
                if (string.IsNullOrEmpty(entity.ApprovalGroupName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval Group Name is required.", 400));

                bool result = _master.UpdateMasterApprovalGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Approval group updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update approval group.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterApprovalGroup/{ID}")]
        public IActionResult SoftDeleteMasterApprovalGroup(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Approval Group ID.", 400));

                bool result = _master.SoftDeleteMasterApprovalGroup(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Approval group soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Approval group with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterBatch Endpoints

        [HttpGet("GetMasterBatches")]
        public IActionResult GetMasterBatches()
        {
            try
            {
                var result = _master.GetMasterBatches();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No batch records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Batches retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBatch")]
        public IActionResult InsertMasterBatch([FromBody] MasterBatchEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch data is required.", 400));
                if (string.IsNullOrEmpty(entity.BatchID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch ID is required.", 400));
                if (entity.CollegeID == null || entity.CollegeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid College ID is required.", 400));
                if (entity.CourseID == null || entity.CourseID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course ID is required.", 400));
                if (entity.BatchStartDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch Start Date is required.", 400));
                if (entity.BatchEndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch End Date is required.", 400));
                if (entity.AdmissionEndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Admission End Date is required.", 400));

                bool result = _master.InsertMasterBatch(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert batch. BatchID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterBatch")]
        public IActionResult UpdateMasterBatch([FromBody] MasterBatchEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch data.", 400));
                if (string.IsNullOrEmpty(entity.BatchID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch ID is required.", 400));
                if (entity.CollegeID == null || entity.CollegeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid College ID is required.", 400));
                if (entity.CourseID == null || entity.CourseID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course ID is required.", 400));
                if (entity.BatchStartDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch Start Date is required.", 400));
                if (entity.BatchEndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch End Date is required.", 400));
                if (entity.AdmissionEndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Admission End Date is required.", 400));

                bool result = _master.UpdateMasterBatch(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update batch.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

      
        [HttpPost]
        [Route("SoftDeleteMasterBatch/{ID}")]
        public IActionResult SoftDeleteMasterBatch(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Batch ID.", 400));

                bool result = _master.SoftDeleteMasterBatch(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Batch with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region Country Endpoints

        [HttpGet("GetMasterCountries")]
        public IActionResult GetMasterCountries()
        {
            try
            {
                var result = _master.GetMasterCountries();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No countries found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Countries retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterCountryNew")]
        public IActionResult InsertMasterCountryNew([FromBody] MasterCountryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>.ErrorResponse("Country data is required.", 400));

            if (entity.CountryID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Valid Country ID is required.", 400));

            if (string.IsNullOrEmpty(entity.Country))
                return BadRequest(ApiResponse<string>.ErrorResponse("Country name is required.", 400));

            try
            {
                entity.IsActive = true;

                int result = _master.InsertMasterCountry(entity);

                if (result > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(result, "Country inserted successfully."));

             
                return Conflict(ApiResponse<string>.ErrorResponse(
                    $"Failed to insert country. A country with ID {entity.CountryID} or name '{entity.Country}' may already exist.",
                    409));
            }
            catch (Exception ex)
            {
                
                CommonHelper.SaveException(ex.Message, "InsertMasterCountryNew");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterCountry")]
        public ActionResult<ApiResponse<string>> UpdateMasterCountry(
            [FromBody] MasterCountryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Country data cannot be null.", 400));

            if (entity.CountryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Country ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Country))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Country name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterCountry(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update country.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Country updated successfully.",
                        "Country updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterCountry");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterCountry/{CountryID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterCountry(int CountryID)
        {
            if (CountryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Country ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterCountry(CountryID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Country with ID {CountryID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Country soft deleted successfully.",
                        "Country soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterCountry");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ApprovalOrder Endpoints

        [HttpGet("GetMasterApprovalOrders")]
        public IActionResult GetMasterApprovalOrders()
        {
            try
            {
                var result = _master.GetMasterApprovalOrders();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No approval orders found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Approval orders retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterApprovalOrder")]
        public IActionResult InsertMasterApprovalOrder([FromBody] MasterApprovalOrderEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval order data is required.", 400));
                if (string.IsNullOrEmpty(entity.ApprovalOrderNo))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval Order No is required.", 400));
                if (string.IsNullOrEmpty(entity.ApprovalOrder))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Approval Order URL is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterApprovalOrder(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Approval order inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert approval order. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("UpdateMasterApprovalOrder")]
        public ActionResult<ApiResponse<string>> UpdateMasterApprovalOrder([FromBody] MasterApprovalOrderEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid approval order data.", 400));
            if (string.IsNullOrEmpty(entity.ApprovalOrderNo))
                return BadRequest(ApiResponse<string>.ErrorResponse("Approval Order No is required.", 400));
            if (string.IsNullOrEmpty(entity.ApprovalOrder))
                return BadRequest(ApiResponse<string>.ErrorResponse("Approval Order URL is required.", 400));

            try
            {
                bool result = _master.UpdateMasterApprovalOrder(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update approval order.", 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Approval order updated successfully.",
                    "Approval order updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterApprovalOrder");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

     
        [HttpPost]
        [Route("SoftDeleteMasterApprovalOrder/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterApprovalOrder(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterApprovalOrder(ID);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Approval order with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Approval order soft deleted successfully.",
                    "Approval order soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterApprovalOrder");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region SubSector Endpoints

        [HttpGet("GetMasterSubSectors")]
        public IActionResult GetMasterSubSectors()
        {
            try
            {
                var result = _master.GetMasterSubSectors();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No sub-sectors found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Sub-sectors retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSubSector")]
        public IActionResult InsertMasterSubSector([FromBody] MasterSubSectorEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sub-sector data is required.", 400));
                if (string.IsNullOrEmpty(entity.SubSector))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sub-Sector name is required.", 400));
                if (entity.SectorID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Sector ID is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSubSector(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Sub-sector inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert sub-sector.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSubSector")]
        public ActionResult<ApiResponse<string>> UpdateMasterSubSector([FromBody] MasterSubSectorEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sub-sector data cannot be null.", 400));

            if (entity.SubSectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sub-Sector ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.SubSector))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sub-Sector name is required.", 400));

            if (entity.SectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Sector ID is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSubSector(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update sub-sector.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sub-sector updated successfully.",
                        "Sub-sector updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSubSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterSubSector/{SubSectorID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSubSector(int SubSectorID)
        {
            if (SubSectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sub-Sector ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSubSector(SubSectorID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Sub-Sector with ID {SubSectorID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sub-sector soft deleted successfully.",
                        "Sub-sector soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region SubjectCourse Endpoints

        [HttpGet("GetMasterSubjectCourses")]
        public IActionResult GetMasterSubjectCourses()
        {
            try
            {
                var result = _master.GetMasterSubjectCourses();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No subject courses found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Subject courses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSubjectCourse")]
        public IActionResult InsertMasterSubjectCourse([FromBody] MasterSubjectCourseEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject course data is required.", 400));
                if (entity.CourseID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course ID is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Code is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Name is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Code is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Type is required.", 400));

                bool result = _master.InsertMasterSubjectCourse(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject course inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert. SubjectCode may already exist for this CourseID.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSubjectCourse")]
        public ActionResult<ApiResponse<string>> UpdateMasterSubjectCourse(
     [FromBody] MasterSubjectCourseEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Subject course data cannot be null.", 400));

            if ((entity.OldCourseID ?? 0) <= 0 || string.IsNullOrEmpty(entity.OldSubjectCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Original CourseID and SubjectCode are required to locate the record.", 400));

            if (entity.CourseID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Course ID is required.", 400));

            if (string.IsNullOrEmpty(entity.CourseCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Course Code is required.", 400));

            if (string.IsNullOrEmpty(entity.SubjectName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Subject Name is required.", 400));

            if (string.IsNullOrEmpty(entity.SubjectCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Subject Code is required.", 400));

            if (string.IsNullOrEmpty(entity.SubjectType))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Subject Type is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSubjectCourse(entity);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse("Failed to update. Record not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Subject course updated successfully.",
                        "Subject course updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSubjectCourse");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterSubjectCourse/{CourseID}/{SubjectCode}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSubjectCourse(int CourseID, string SubjectCode)
        {
            if (CourseID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Course ID.", 400));

            if (string.IsNullOrEmpty(SubjectCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Subject Code is required.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSubjectCourse(CourseID, SubjectCode);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Record not found for CourseID {CourseID} / SubjectCode {SubjectCode}.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Subject course soft deleted successfully.",
                        "Subject course soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSubjectCourse");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterLanguage Endpoints

        [HttpGet("GetMasterLanguages")]
        public IActionResult GetMasterLanguages()
        {
            try
            {
                var result = _master.GetMasterLanguages();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No languages found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Languages retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterLanguage")]
        public IActionResult InsertMasterLanguage([FromBody] MasterLanguageEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Language data is required.", 400));
                if (entity.LanguageID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Language ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Language))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Language name is required.", 400));

                bool result = _master.InsertMasterLanguage(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Language inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert. LanguageID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterLanguage")]
        public ActionResult<ApiResponse<string>> UpdateMasterLanguage(
     [FromBody] MasterLanguageEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Language data cannot be null.", 400));

            if (entity.LanguageID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Language ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Language))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Language name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterLanguage(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update language.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Language updated successfully.",
                        "Language updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterLanguage");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterLanguage/{LanguageID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterLanguage(int LanguageID)
        {
            if (LanguageID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Language ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterLanguage(LanguageID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Language with ID {LanguageID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Language soft deleted successfully.",
                        "Language soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLanguage");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Designation Endpoints

        [HttpGet("GetMasterDesignations")]
        public IActionResult GetMasterDesignations()
        {
            try
            {
                var result = _master.GetMasterDesignations();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No designations found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Designations retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterDesignation")]
        public IActionResult InsertMasterDesignation([FromBody] MasterDesignationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Designation data is required.", 400));
                if (entity.DesignationId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Designation ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Designation))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Designation name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterDesignation(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Designation inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert designation. Designation ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterDesignation")]
        public ActionResult<ApiResponse<string>> UpdateMasterDesignation(
              [FromBody] MasterDesignationEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Designation data cannot be null.", 400));

            if (entity.DesignationId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Designation ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Designation))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Designation name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterDesignation(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update designation.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Designation updated successfully.",
                        "Designation updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterDesignation");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterDesignation/{DesignationId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterDesignation(int DesignationId)
        {
            if (DesignationId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Designation ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterDesignation(DesignationId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Designation with ID {DesignationId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Designation soft deleted successfully.",
                        "Designation soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterDesignation");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region CourseType Endpoints

        [HttpGet("GetMasterCourseTypes")]
        public IActionResult GetMasterCourseTypes()
        {
            try
            {
                var result = _master.GetMasterCourseTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No course types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Course types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterCourseType")]
        public IActionResult InsertMasterCourseType([FromBody] MasterCourseTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course type data is required.", 400));
                if (entity.CourseTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Type name is required.", 400));

                bool result = _master.InsertMasterCourseType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert course type. CourseTypeID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterCourseType")]
        public IActionResult UpdateMasterCourseType([FromBody] MasterCourseTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.CourseTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid course type data.", 400));
                if (string.IsNullOrEmpty(entity.CourseType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Type name is required.", 400));

                bool result = _master.UpdateMasterCourseType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update course type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterCourseType/{CourseTypeID}")]
        public IActionResult SoftDeleteMasterCourseType(int CourseTypeID)
        {
            try
            {
                if (CourseTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Course Type ID.", 400));

                bool result = _master.SoftDeleteMasterCourseType(CourseTypeID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Course type with ID {CourseTypeID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterDocuments Endpoints

        [HttpGet("GetMasterDocuments")]
        public IActionResult GetMasterDocuments()
        {
            try
            {
                var result = _master.GetMasterDocuments();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No documents found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Documents retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterDocument")]
        public IActionResult InsertMasterDocument([FromBody] MasterDocumentEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Document data is required.", 400));
                if (entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Document ID is required.", 400));
                if (string.IsNullOrEmpty(entity.DocumentName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Document Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterDocument(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Document inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert document. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterDocument")]
        public ActionResult<ApiResponse<string>> UpdateMasterDocument([FromBody] MasterDocumentEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid document data.", 400));

            if (string.IsNullOrEmpty(entity.DocumentName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Document Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterDocument(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update document.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Document updated successfully.",
                        "Document updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterDocument");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterDocument/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterDocument(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Document ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterDocument(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Document with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Document soft deleted successfully.",
                        "Document soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterDocument");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region FacilityGroup Endpoints

        [HttpGet("GetMasterFacilityGroups")]
        public IActionResult GetMasterFacilityGroups()
        {
            try
            {
                var result = _master.GetMasterFacilityGroups();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No facility groups found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Facility groups retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterFacilityGroup")]
        public IActionResult InsertMasterFacilityGroup([FromBody] MasterFacilityGroupEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Facility group data is required.", 400));
                if (entity.FacilityGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Facility Group ID is required.", 400));
                if (string.IsNullOrEmpty(entity.FacilityGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Facility Group Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterFacilityGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Facility group inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert facility group. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterFacilityGroup")]   
        public IActionResult UpdateMasterFacilityGroup([FromBody] MasterFacilityGroupEntity entity)
        {
            try
            {
                if (entity == null || entity.FacilityGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid facility group data.", 400));
                if (string.IsNullOrEmpty(entity.FacilityGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Facility Group Name is required.", 400));

                bool result = _master.UpdateMasterFacilityGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Facility group updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update facility group.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterFacilityGroup/{FacilityGroupId}")]   
        public IActionResult SoftDeleteMasterFacilityGroup(int FacilityGroupId)
        {
            try
            {
                if (FacilityGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Facility Group ID.", 400));

                bool result = _master.SoftDeleteMasterFacilityGroup(FacilityGroupId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Facility group soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Facility Group with ID {FacilityGroupId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region BloodGroup Endpoints

        [HttpGet("GetMasterBloodGroups")]
        public IActionResult GetMasterBloodGroups()
        {
            try
            {
                var result = _master.GetMasterBloodGroups();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No blood groups found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Blood groups retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBloodGroup")]
        public IActionResult InsertMasterBloodGroup([FromBody] MasterBloodGroupEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Blood group data is required.", 400));
                if (entity.BloodGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Blood Group ID is required.", 400));
                if (string.IsNullOrEmpty(entity.BloodGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Blood Group name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBloodGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Blood group inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert blood group. BloodGroupId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

     
        [HttpPost("UpdateMasterBloodGroup")]
        public IActionResult UpdateMasterBloodGroup([FromBody] MasterBloodGroupEntity entity)
        {
            try
            {
                if (entity == null || entity.BloodGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid blood group data.", 400));
                if (string.IsNullOrEmpty(entity.BloodGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Blood Group name is required.", 400));

                bool result = _master.UpdateMasterBloodGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Blood group updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update blood group.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

     
        [HttpPost("SoftDeleteMasterBloodGroup/{BloodGroupId}")]
        public IActionResult SoftDeleteMasterBloodGroup(int BloodGroupId)
        {
            try
            {
                if (BloodGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Blood Group ID.", 400));

                bool result = _master.SoftDeleteMasterBloodGroup(BloodGroupId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Blood group soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Blood group with ID {BloodGroupId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterGender Endpoints

        [HttpGet("GetMasterGenders")]
        public IActionResult GetMasterGenders()
        {
            try
            {
                var result = _master.GetMasterGenders();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No genders found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Genders retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterGender")]
        public IActionResult InsertMasterGender([FromBody] MasterGenderEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Gender data is required.", 400));

                if (string.IsNullOrEmpty(entity.GenderCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Gender Code is required.", 400));

                if (string.IsNullOrEmpty(entity.Gender))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Gender Name is required.", 400));

                entity.GenderCode = entity.GenderCode.Trim().ToUpper();
                entity.Gender = entity.Gender.Trim();
                entity.IsActive = true;

                bool result = _master.InsertMasterGender(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Gender inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert gender. GenderCode may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterGender")]
        public ActionResult<ApiResponse<string>> UpdateMasterGender([FromBody] MasterGenderEntity entity)
        {
            if (entity == null || string.IsNullOrEmpty(entity.GenderCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid gender data.", 400));

            if (string.IsNullOrEmpty(entity.Gender))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Gender Name is required.", 400));

            try
            {
                entity.GenderCode = entity.GenderCode.Trim().ToUpper();
                entity.Gender = entity.Gender.Trim();

                bool result = _master.UpdateMasterGender(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update gender.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Gender updated successfully.",
                        "Gender updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterGender");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterGender/{GenderCode}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterGender(string GenderCode)
        {
            if (string.IsNullOrEmpty(GenderCode))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Gender Code.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterGender(GenderCode.Trim().ToUpper());

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Gender with Code {GenderCode} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Gender soft deleted successfully.",
                        "Gender soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterGender");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region BuildingFloor Endpoints

        [HttpGet("GetMasterBuildingFloors")]
        public IActionResult GetMasterBuildingFloors()
        {
            try
            {
                var result = _master.GetMasterBuildingFloor();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No building floors found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Building floors retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBuildingFloor")]
        public IActionResult InsertMasterBuildingFloor([FromBody] MasterBuildingFloorEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building floor data is required.", 400));
                if (entity.FloorId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Floor ID is required.", 400));
                if (string.IsNullOrEmpty(entity.FloorName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Floor Name is required.", 400));

                bool result = _master.InsertMasterBuildingFloor(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building floor inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert building floor. FloorId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("UpdateMasterBuildingFloor")]
        public ActionResult<ApiResponse<string>> UpdateMasterBuildingFloor([FromBody] MasterBuildingFloorEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Building floor data cannot be null.", 400));

            if (entity.FloorId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.FloorName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterBuildingFloor(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update building floor.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Building floor updated successfully.",
                        "Building floor updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingFloor");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterBuildingFloor/{FloorId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterBuildingFloor(int FloorId)
        {
            if (FloorId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterBuildingFloor(FloorId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Building floor with ID {FloorId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Building floor soft deleted successfully.",
                        "Building floor soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingFloor");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region BuildingNameType Endpoints

        [HttpGet("GetMasterBuildingNameTypes")]
        public IActionResult GetMasterBuildingNameTypes()
        {
            try
            {
                var result = _master.GetMasterBuildingNameTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No building name types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Building name types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBuildingNameType")]
        public IActionResult InsertMasterBuildingNameType([FromBody] MasterBuildingNameTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building name type data is required.", 400));
                if (entity.BuildingNameTypeId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Building Name Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.BuildingNameType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building Name Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBuildingNameType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building name type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert building name type. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost("UpdateMasterBuildingNameType")]
        public IActionResult UpdateMasterBuildingNameType([FromBody] MasterBuildingNameTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.BuildingNameTypeId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid building name type data.", 400));
                if (string.IsNullOrEmpty(entity.BuildingNameType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building Name Type is required.", 400));

                bool result = _master.UpdateMasterBuildingNameType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building name type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update building name type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }


        [HttpPost("SoftDeleteMasterBuildingNameType/{BuildingNameTypeId}")]
        public IActionResult SoftDeleteMasterBuildingNameType(int BuildingNameTypeId)
        {
            try
            {
                if (BuildingNameTypeId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Building Name Type ID.", 400));

                bool result = _master.SoftDeleteMasterBuildingNameType(BuildingNameTypeId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building name type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Building Name Type with ID {BuildingNameTypeId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region BuildingOwnershipType Endpoints

        [HttpGet("GetMasterBuildingOwnershipTypes")]
        public IActionResult GetMasterBuildingOwnershipTypes()
        {
            try
            {
                var result = _master.GetMasterBuildingOwnershipTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No building ownership types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Building ownership types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBuildingOwnershipType")]
        public IActionResult InsertMasterBuildingOwnershipType([FromBody] MasterBuildingOwnershipTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership type data is required.", 400));
                if (entity.OwnerShipTypeid <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Ownership Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.OwnerShipType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBuildingOwnershipType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building ownership type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert ownership type. OwnerShipTypeid may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterBuildingOwnershipType")]
        public IActionResult UpdateMasterBuildingOwnershipType([FromBody] MasterBuildingOwnershipTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.OwnerShipTypeid <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ownership type data.", 400));
                if (string.IsNullOrEmpty(entity.OwnerShipType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Type is required.", 400));

                bool result = _master.UpdateMasterBuildingOwnershipType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building ownership type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update ownership type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpPost("SoftDeleteMasterBuildingOwnershipType/{OwnerShipTypeid}")]
        public IActionResult SoftDeleteMasterBuildingOwnershipType(int OwnerShipTypeid)
        {
            try
            {
                if (OwnerShipTypeid <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Ownership Type ID.", 400));

                bool result = _master.SoftDeleteMasterBuildingOwnershipType(OwnerShipTypeid);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building ownership type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Ownership type with ID {OwnerShipTypeid} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region BuildingStatus Endpoints

        [HttpGet("GetMasterBuildingStatuses")]
        public IActionResult GetMasterBuildingStatuses()
        {
            try
            {
                var result = _master.GetMasterBuildingStatuses();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No building statuses found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Building statuses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBuildingStatus")]
        public IActionResult InsertMasterBuildingStatus([FromBody] MasterBuildingStatusEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building status data is required.", 400));
                if (entity.BuildingStatusId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Building Status ID is required.", 400));
                if (string.IsNullOrEmpty(entity.BuildingStatus))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Building Status is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBuildingStatus(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building status inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert building status. BuildingStatusId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterBuildingStatus")]
        public ActionResult<ApiResponse<string>> UpdateMasterBuildingStatus([FromBody] MasterBuildingStatusEntity entity)
        {
            if (entity == null || entity.BuildingStatusId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid building status data.", 400));

            if (string.IsNullOrEmpty(entity.BuildingStatus))
                return BadRequest(ApiResponse<string>.ErrorResponse("Building Status is required.", 400));

            try
            {
                bool result = _master.UpdateMasterBuildingStatus(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update building status.", 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Building status updated successfully.",
                    "Building status updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterBuildingStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterBuildingStatus/{BuildingStatusId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterBuildingStatus(int BuildingStatusId)
        {
            if (BuildingStatusId <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Building Status ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterBuildingStatus(BuildingStatusId);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Building status with ID {BuildingStatusId} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Building status soft deleted successfully.",
                    "Building status soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBuildingStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region BuildingUsageType Endpoints

        [HttpGet("GetMasterBuildingUsageTypes")]
        public IActionResult GetMasterBuildingUsageTypes()
        {
            try
            {
                var result = _master.GetMasterBuildingUsageTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No building usage types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Building usage types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBuildingUsageType")]
        public IActionResult InsertMasterBuildingUsageType([FromBody] MasterBuildingUsageTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Usage type data is required.", 400));
                if (entity.UsageTypeId == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Usage Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.UsageType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Usage Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBuildingUsageType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building usage type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert. UsageTypeId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpPost("UpdateMasterBuildingUsageType")]
        public IActionResult UpdateMasterBuildingUsageType([FromBody] MasterBuildingUsageTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.UsageTypeId == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid usage type data.", 400));
                if (string.IsNullOrEmpty(entity.UsageType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Usage Type is required.", 400));

                bool result = _master.UpdateMasterBuildingUsageType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building usage type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update building usage type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterBuildingUsageType/{UsageTypeId}")]
        public IActionResult SoftDeleteMasterBuildingUsageType(int UsageTypeId)
        {
            try
            {
                if (UsageTypeId == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Usage Type ID.", 400));

                bool result = _master.SoftDeleteMasterBuildingUsageType(UsageTypeId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Building usage type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Usage Type with ID {UsageTypeId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region Constituency Endpoints

        [HttpGet("GetMasterConstituencies")]
        public IActionResult GetMasterConstituencies()
        {
            try
            {
                var result = _master.GetMasterConstituencies();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No constituencies found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Constituencies retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterConstituency")]
        public IActionResult InsertMasterConstituency([FromBody] MasterConstituencyEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Constituency data is required.", 400));

                if (string.IsNullOrEmpty(entity.Constituency))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Constituency Name is required.", 400));

                if (entity.DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid District ID is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterConstituency(entity);

                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Constituency inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert constituency. It may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterConstituency")]
        public IActionResult UpdateMasterConstituency([FromBody] MasterConstituencyEntity entity)
        {
            try
            {
                if (entity == null || entity.ConstituencyID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid constituency data.", 400));
                if (string.IsNullOrEmpty(entity.Constituency))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Constituency Name is required.", 400));
                if (entity.DistrictID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid District ID is required.", 400));

                bool result = _master.UpdateMasterConstituency(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Constituency updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update constituency.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterConstituency/{ConstituencyID}")]
        public IActionResult SoftDeleteMasterConstituency(int ConstituencyID)
        {
            try
            {
                if (ConstituencyID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Constituency ID.", 400));

                bool result = _master.SoftDeleteMasterConstituency(ConstituencyID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Constituency soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Constituency with ID {ConstituencyID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region ConstructionYear Endpoints

        [HttpGet("GetMasterConstructionYears")]
        public IActionResult GetMasterConstructionYears()
        {
            try
            {
                var result = _master.GetMasterConstructionYears();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No construction years found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Construction years retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterConstructionYear")]
        public IActionResult InsertMasterConstructionYear([FromBody] MasterConstructionYearEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Construction year data is required.", 400));
                if (entity.YearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Year is required.", 400));

                bool result = _master.InsertMasterConstructionYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Construction year inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert construction year. It may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterConstructionYear")]
        public IActionResult UpdateMasterConstructionYear([FromBody] MasterConstructionYearEntity entity)
        {
            try
            {
                if (entity == null || entity.YearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid construction year data.", 400));

                bool result = _master.UpdateMasterConstructionYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Construction year updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update construction year.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterConstructionYear/{YearId}")]
        public IActionResult SoftDeleteMasterConstructionYear(int YearId)
        {
            try
            {
                if (YearId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Year ID.", 400));

                bool result = _master.SoftDeleteMasterConstructionYear(YearId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Construction year soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Construction year with ID {YearId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region ContactUsType Endpoints

        [HttpGet("GetMasterContactUsTypes")]
        public IActionResult GetMasterContactUsTypes()
        {
            try
            {
                var result = _master.GetMasterContactUsTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No contact us types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Contact us types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterContactUsType")]
        public IActionResult InsertMasterContactUsType([FromBody] MasterContactUsTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Contact Us Type data is required.", 400));
                if (string.IsNullOrEmpty(entity.ContactUsType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Contact Us Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterContactUsType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Contact us type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert contact us type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterContactUsType")]
        public ActionResult<ApiResponse<string>> UpdateMasterContactUsType([FromBody] MasterContactUsTypeEntity entity)
        {
            if (entity == null || entity.ContactUsTypeID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid contact us type data.", 400));

            if (string.IsNullOrEmpty(entity.ContactUsType))
                return BadRequest(ApiResponse<string>.ErrorResponse("Contact Us Type is required.", 400));

            try
            {
                bool result = _master.UpdateMasterContactUsType(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update contact us type.", 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Contact us type updated successfully.",
                    "Contact us type updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterContactUsType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterContactUsType/{ContactUsTypeID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterContactUsType(int ContactUsTypeID)
        {
            if (ContactUsTypeID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Contact Us Type ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterContactUsType(ContactUsTypeID);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Contact Us Type with ID {ContactUsTypeID} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Contact us type soft deleted successfully.",
                    "Contact us type soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterContactUsType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region CourseApprover Endpoints

        [HttpGet("GetMasterCourseApprovers")]
        public IActionResult GetMasterCourseApprovers()
        {
            try
            {
                var result = _master.GetMasterCourseApprovers();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No course approvers found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Course approvers retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterCourseApprover")]
        public IActionResult InsertMasterCourseApprover([FromBody] MasterCourseApproverEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course approver data is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseApprover))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Approver is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterCourseApprover(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course approver inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert course approver.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterCourseApprover")]
        public IActionResult UpdateMasterCourseApprover([FromBody] MasterCourseApproverEntity entity)
        {
            try
            {
                if (entity == null || entity.CourseApproverID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid course approver data.", 400));
                if (string.IsNullOrEmpty(entity.CourseApprover))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Approver is required.", 400));

                bool result = _master.UpdateMasterCourseApprover(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course approver updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update course approver.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterCourseApprover/{CourseApproverID}")]
        public IActionResult SoftDeleteMasterCourseApprover(int CourseApproverID)
        {
            try
            {
                if (CourseApproverID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Course Approver ID.", 400));

                bool result = _master.SoftDeleteMasterCourseApprover(CourseApproverID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Course approver soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Course Approver with ID {CourseApproverID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion
       
        #region Sector Endpoints

        [HttpGet("GetMasterSectors")]
        public IActionResult GetMasterSectors()
        {
            try
            {
                var result = _master.GetMasterSectors();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectors found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Sectors retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSector")]
        public IActionResult InsertMasterSector([FromBody] MasterSectorEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sector data is required.", 400));
                if (entity.SectorID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Sector ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Sector))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sector Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSector(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Sector inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert sector. SectorID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSector")]
        public ActionResult<ApiResponse<string>> UpdateMasterSector(
    [FromBody] MasterSectorEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector data cannot be null.", 400));

            if (entity.SectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Sector))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSector(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update sector.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sector updated successfully.",
                        "Sector updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterSector/{SectorID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSector(int SectorID)
        {
            if (SectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSector(SectorID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Sector with ID {SectorID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sector soft deleted successfully.",
                        "Sector soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ElectiveSubject Endpoints

        [HttpGet("GetMasterElectiveSubjects")]
        public IActionResult GetMasterElectiveSubjects()
        {
            try
            {
                var result = _master.GetMasterElectiveSubjects();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No elective subjects found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Elective subjects retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterElectiveSubject")]
        public IActionResult InsertMasterElectiveSubject([FromBody] MasterElectiveSubjectEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject data is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Name is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Type is required.", 400));
                if (entity.GroupID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Group ID is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterElectiveSubject(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Elective subject inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert elective subject.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateMasterElectiveSubject")]
        public IActionResult UpdateMasterElectiveSubject([FromBody] MasterElectiveSubjectEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid subject data.", 400));
                if (string.IsNullOrEmpty(entity.SubjectName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Name is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Type is required.", 400));
                if (entity.GroupID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Group ID is required.", 400));

                bool result = _master.UpdateMasterElectiveSubject(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Elective subject updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update elective subject.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("SoftDeleteMasterElectiveSubject/{ID}")]
        public IActionResult SoftDeleteMasterElectiveSubject(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Subject ID.", 400));

                bool result = _master.SoftDeleteMasterElectiveSubject(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Elective subject soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Elective subject with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion
        
        #region MasterTitle Endpoints

        [HttpGet("GetMasterTitles")]
        public IActionResult GetMasterTitles()
        {
            try
            {
                var result = _master.GetMasterTitles();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No titles found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Titles retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTitle")]
        public IActionResult InsertMasterTitle([FromBody] MasterTitleEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Title data is required.", 400));
                if (entity.TitleID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Title ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Title))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Title is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterTitle(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Title inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert title. TitleID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTitle")]
        public IActionResult UpdateMasterTitle([FromBody] MasterTitleEntity entity)
        {
            try
            {
                if (entity == null || entity.TitleID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid title data.", 400));
                if (string.IsNullOrEmpty(entity.Title))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Title is required.", 400));

                bool result = _master.UpdateMasterTitle(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Title updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update title.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTitle/{TitleID}")]
        public IActionResult SoftDeleteMasterTitle(int TitleID)
        {
            try
            {
                if (TitleID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Title ID.", 400));

                bool result = _master.SoftDeleteMasterTitle(TitleID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Title soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Title with ID {TitleID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region SignatureAuthority Endpoints

        [HttpGet("GetMasterSignatureAuthorities")]
        public IActionResult GetMasterSignatureAuthorities()
        {
            try
            {
                var result = _master.GetMasterSignatureAuthorities();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No signature authorities found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Signature authorities retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSignatureAuthority")]
        public IActionResult InsertMasterSignatureAuthority([FromBody] MasterSignatureAuthorityEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Signature authority data is required.", 400));
                if (string.IsNullOrEmpty(entity.SignatureType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Signature Type is required.", 400));
                if (string.IsNullOrEmpty(entity.NameOfAuthority))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Name of Authority is required.", 400));
                if (string.IsNullOrEmpty(entity.Designation))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Designation is required.", 400));
                if (string.IsNullOrEmpty(entity.SignaturePath))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Signature document is required.", 400));

                entity.IsActive = true;
                int newId = _master.InsertMasterSignatureAuthority(entity);
                if (newId > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newId, "Signature authority inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert signature authority.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSignatureAuthority")]
        public ActionResult<ApiResponse<string>> UpdateMasterSignatureAuthority(
            [FromBody] MasterSignatureAuthorityEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid signature authority data.", 400));

            if (string.IsNullOrEmpty(entity.SignatureType))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Signature Type is required.", 400));

            if (string.IsNullOrEmpty(entity.NameOfAuthority))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Name of Authority is required.", 400));

            if (string.IsNullOrEmpty(entity.Designation))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Designation is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSignatureAuthority(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update signature authority.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Signature authority updated successfully.",
                        "Signature authority updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSignatureAuthority");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterSignatureAuthority/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSignatureAuthority(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSignatureAuthority(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Signature authority with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Signature authority soft deleted successfully.",
                        "Signature authority soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSignatureAuthority");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        [HttpPost("UploadSignatureFile")]
        [RequestSizeLimit(5 * 1024 * 1024)] 
        public async Task<IActionResult> UploadSignatureFile(IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("No file uploaded.", 400));

                var allowedExtensions = new[] { ".png", ".jpg", ".jpeg", ".pdf" };
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExtensions.Contains(ext))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid file type. Allowed: PNG, JPG, PDF.", 400));

                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest(ApiResponse<string>.ErrorResponse("File exceeds 5MB limit.", 400));

                var fileName = $"{Guid.NewGuid()}{ext}";
                var folder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "SignatureDocuments");
                Directory.CreateDirectory(folder);

                var fullPath = Path.Combine(folder, fileName);
                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }
                var relativePath = $"/SignatureDocuments/{fileName}";

                return Ok(ApiResponse<string>.SuccessResponse(relativePath, "File uploaded successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UploadSignatureFile");
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region FloorPreference Endpoints

        [HttpGet("GetMasterFloorPreferences")]
        public IActionResult GetMasterFloorPreferences()
        {
            try
            {
                var result = _master.GetMasterFloorPreferences();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No floor preferences found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Floor preferences retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterFloorPreference")]
        public IActionResult InsertMasterFloorPreference([FromBody] MasterFloorPreferenceEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Floor data is required.", 400));
                if (entity.FloorId < 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Floor ID is required.", 400));
                if (string.IsNullOrEmpty(entity.FloorName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Floor Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterFloorPreference(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Floor preference inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert floor preference. FloorId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterFloorPreference")]
        public ActionResult<ApiResponse<string>> UpdateMasterFloorPreference(
            [FromBody] MasterFloorPreferenceEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor data cannot be null.", 400));

            if (entity.FloorId < 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor ID must be valid.", 400));

            if (string.IsNullOrEmpty(entity.FloorName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterFloorPreference(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update floor preference.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Floor preference updated successfully.",
                        "Floor preference updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterFloorPreference");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterFloorPreference/{FloorId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterFloorPreference(int FloorId)
        {
            if (FloorId < 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Floor ID must be valid.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterFloorPreference(FloorId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Floor with ID {FloorId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Floor preference soft deleted successfully.",
                        "Floor preference soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFloorPreference");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region GrievanceCategory Endpoints

        [HttpGet("GetMasterGrievanceCategories")]
        public IActionResult GetMasterGrievanceCategories()
        {
            try
            {
                var result = _master.GetMasterGrievanceCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No grievance categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Grievance categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterGrievanceCategory")]
        public IActionResult InsertMasterGrievanceCategory([FromBody] MasterGrievanceCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Grievance category data is required.", 400));
                if (entity.GrievanceCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Grievance Category ID is required.", 400));
                if (string.IsNullOrEmpty(entity.GrievanceCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Grievance Category name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterGrievanceCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Grievance category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert category. GrievanceCategoryID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterGrievanceCategory")]
        public IActionResult UpdateMasterGrievanceCategory([FromBody] MasterGrievanceCategoryEntity entity)
        {
            try
            {
                if (entity == null || entity.GrievanceCategoryID == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid grievance category data.", 400));
                if (string.IsNullOrEmpty(entity.GrievanceCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Grievance Category name is required.", 400));

                bool result = _master.UpdateMasterGrievanceCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Grievance category updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterGrievanceCategory/{GrievanceCategoryID}")]
        public IActionResult SoftDeleteMasterGrievanceCategory(int GrievanceCategoryID)
        {
            try
            {
                if (GrievanceCategoryID == 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Grievance Category ID.", 400));
                if (GrievanceCategoryID == -1)
                    return BadRequest(ApiResponse<string>.ErrorResponse("The 'NA' system record cannot be deleted.", 400));

                bool result = _master.SoftDeleteMasterGrievanceCategory(GrievanceCategoryID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Grievance category soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Category with ID {GrievanceCategoryID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region FAQCategory Endpoints

        [HttpGet("GetMasterFAQCategories")]
        public IActionResult GetMasterFAQCategories()
        {
            try
            {
                var result = _master.GetMasterFAQCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No FAQ categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "FAQ categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterFAQCategory")]
        public IActionResult InsertMasterFAQCategory([FromBody] MasterFAQCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("FAQ category data is required.", 400));
                if (entity.FAQCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid FAQ Category ID is required.", 400));
                if (string.IsNullOrEmpty(entity.FAQCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("FAQ Category is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterFAQCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "FAQ category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert FAQ category. FAQCategoryID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterFAQCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterFAQCategory(
             [FromBody] MasterFAQCategoryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("FAQ category data cannot be null.", 400));

            if (entity.FAQCategoryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("FAQ Category ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.FAQCategory))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("FAQ Category is required.", 400));

            try
            {
                bool result = _master.UpdateMasterFAQCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update FAQ category.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "FAQ category updated successfully.",
                        "FAQ category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterFAQCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterFAQCategory/{FAQCategoryID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterFAQCategory(int FAQCategoryID)
        {
            if (FAQCategoryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("FAQ Category ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterFAQCategory(FAQCategoryID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"FAQ Category with ID {FAQCategoryID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "FAQ category soft deleted successfully.",
                        "FAQ category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFAQCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region FacilitySubGroup Endpoints

        [HttpGet("GetMasterFacilitySubGroups")]
        public IActionResult GetMasterFacilitySubGroups()
        {
            try
            {
                var result = _master.GetMasterFacilitySubGroups();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No sub facility groups found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Sub facility groups retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterFacilitySubGroup")]
        public IActionResult InsertMasterFacilitySubGroup([FromBody] MasterFacilitySubGroupEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sub facility group data is required.", 400));
                if (entity.SubFacilityGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Sub Facility Group ID is required.", 400));
                if (entity.FacilityGroupId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Facility Group ID is required.", 400));
                if (string.IsNullOrEmpty(entity.SubFacilityGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sub Facility Group Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterFacilitySubGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Sub facility group inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert sub facility group. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterFacilitySubGroup")]
        public ActionResult<ApiResponse<string>> UpdateMasterFacilitySubGroup(
            [FromBody] MasterFacilitySubGroupEntity entity)
        {
            if (entity == null || entity.SubFacilityGroupId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid sub facility group data.", 400));

            if (entity.FacilityGroupId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Facility Group ID is required.", 400));

            if (string.IsNullOrEmpty(entity.SubFacilityGroup))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sub Facility Group Name is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.UpdateMasterFacilitySubGroup(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update sub facility group.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sub facility group updated successfully.",
                        "Sub facility group updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterFacilitySubGroup");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterFacilitySubGroup/{SubFacilityGroupId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterFacilitySubGroup(int SubFacilityGroupId)
        {
            if (SubFacilityGroupId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Sub Facility Group ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterFacilitySubGroup(SubFacilityGroupId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Sub Facility Group with ID {SubFacilityGroupId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sub facility group soft deleted successfully.",
                        "Sub facility group soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterFacilitySubGroup");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region JobRole Endpoints

        [HttpGet("GetMasterJobRoles")]
        public IActionResult GetMasterJobRoles()
        {
            try
            {
                var result = _master.GetMasterJobRoles();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No job roles found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Job roles retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterJobRole")]
        public IActionResult InsertMasterJobRole([FromBody] MasterJobRoleEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Job role data is required.", 400));
                if (entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid ID is required.", 400));
                if (string.IsNullOrEmpty(entity.JobRoleName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Job Role Name is required.", 400));

                bool result = _master.InsertMasterJobRole(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Job role inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert job role. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterJobRole")]
        public ActionResult<ApiResponse<string>> UpdateMasterJobRole([FromBody] MasterJobRoleEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Job role data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.JobRoleName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Job Role Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterJobRole(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update job role.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Job role updated successfully.",
                        "Job role updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterJobRole");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterJobRole/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterJobRole(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterJobRole(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Job role with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Job role soft deleted successfully.",
                        "Job role soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterJobRole");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region LocationCategory Endpoints

        [HttpGet("GetMasterLocationCategories")]
        public IActionResult GetMasterLocationCategories()
        {
            try
            {
                var result = _master.GetMasterLocationCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No location categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Location categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterLocationCategory")]
        public IActionResult InsertMasterLocationCategory([FromBody] MasterLocationCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Location category data is required.", 400));
                if (entity.LocationCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Location Category ID is required.", 400));
                if (string.IsNullOrEmpty(entity.LocationCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Location Category is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterLocationCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Location category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert location category. LocationCategoryID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterLocationCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterLocationCategory([FromBody] MasterLocationCategoryEntity entity)
        {
            if (entity == null || entity.LocationCategoryID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid location category data.", 400));

            if (string.IsNullOrEmpty(entity.LocationCategory))
                return BadRequest(ApiResponse<string>.ErrorResponse("Location Category is required.", 400));

            try
            {
                bool result = _master.UpdateMasterLocationCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update location category.", 400));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Location category updated successfully.",
                    "Location category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterLocationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterLocationCategory/{LocationCategoryID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterLocationCategory(int LocationCategoryID)
        {
            if (LocationCategoryID <= 0)
                return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Location Category ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterLocationCategory(LocationCategoryID);

                if (!result)
                    return NotFound(ApiResponse<string>.ErrorResponse($"Location category with ID {LocationCategoryID} not found.", 404));

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Location category soft deleted successfully.",
                    "Location category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLocationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region LandOwnershipType Endpoints

        [HttpGet("GetMasterLandOwnershipTypes")]
        public IActionResult GetMasterLandOwnershipTypes()
        {
            try
            {
                var result = _master.GetMasterLandOwnershipTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No land ownership types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Land ownership types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterLandOwnershipType")]
        public IActionResult InsertMasterLandOwnershipType([FromBody] MasterLandOwnershipTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership type data is required.", 400));
                if (entity.OwnerShipTypeid <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Ownership Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.OwnerShipType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterLandOwnershipType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Land ownership type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert ownership type. OwnerShipTypeid may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterLandOwnershipType")]
        public ActionResult<ApiResponse<string>> UpdateMasterLandOwnershipType(
     [FromBody] MasterLandOwnershipTypeEntity entity)
        {
            if (entity == null || entity.OwnerShipTypeid <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ownership type data.", 400));

            if (string.IsNullOrEmpty(entity.OwnerShipType))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Ownership Type is required.", 400));

            try
            {
                bool result = _master.UpdateMasterLandOwnershipType(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update ownership type.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Land ownership type updated successfully.",
                        "Land ownership type updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterLandOwnershipType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterLandOwnershipType/{OwnerShipTypeid}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterLandOwnershipType(int OwnerShipTypeid)
        {
            if (OwnerShipTypeid <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Ownership Type ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterLandOwnershipType(OwnerShipTypeid);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Ownership type with ID {OwnerShipTypeid} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Land ownership type soft deleted successfully.",
                        "Land ownership type soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterLandOwnershipType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Master Month Endpoints

        [HttpGet("GetMasterMonths")]
        public IActionResult GetMasterMonths()
        {
            try
            {
                var result = _master.GetMasterMonths();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No months found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Months retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterMonth")]
        public IActionResult InsertMasterMonth([FromBody] MasterMonthEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Month data is required.", 400));
                if (entity.MonthId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Month ID is required.", 400));
                if (string.IsNullOrEmpty(entity.MonthsName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Month Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterMonth(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Month inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert month. MonthId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterMonth")]
        public ActionResult<ApiResponse<string>> UpdateMasterMonth(
            [FromBody] MasterMonthEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Month data cannot be null.", 400));

            if (entity.MonthId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Month ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.MonthsName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Month Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterMonth(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update month.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Month updated successfully.",
                        "Month updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterMonth");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterMonth/{MonthId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterMonth(int MonthId)
        {
            if (MonthId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Month ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterMonth(MonthId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Month with ID {MonthId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Month soft deleted successfully.",
                        "Month soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterMonth");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region SecurityQuestion Endpoints

        [HttpGet("GetMasterSecurityQuestions")]
        public IActionResult GetMasterSecurityQuestions()
        {
            try
            {
                var result = _master.GetMasterSecurityQuestions();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No security questions found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Security questions retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSecurityQuestion")]
        public IActionResult InsertMasterSecurityQuestion([FromBody] MasterSecurityQuestionEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Security question data is required.", 400));
                if (entity.SecurityQuestionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Security Question ID is required.", 400));
                if (string.IsNullOrEmpty(entity.SecurityQuestion))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Security Question is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSecurityQuestion(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Security question inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert security question. SecurityQuestionID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateMasterSecurityQuestion")]
        public IActionResult UpdateMasterSecurityQuestion([FromBody] MasterSecurityQuestionEntity entity)
        {
            try
            {
                if (entity == null || entity.SecurityQuestionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid security question data.", 400));
                if (string.IsNullOrEmpty(entity.SecurityQuestion))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Security Question is required.", 400));

                bool result = _master.UpdateMasterSecurityQuestion(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Security question updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update security question.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("SoftDeleteMasterSecurityQuestion/{SecurityQuestionID}")]
        public IActionResult SoftDeleteMasterSecurityQuestion(int SecurityQuestionID)
        {
            try
            {
                if (SecurityQuestionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Security Question ID.", 400));

                bool result = _master.SoftDeleteMasterSecurityQuestion(SecurityQuestionID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Security question soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Security question with ID {SecurityQuestionID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region SkillTrade Endpoints

        [HttpGet("GetMasterSkillTrades")]
        public IActionResult GetMasterSkillTrades()
        {
            try
            {
                var result = _master.GetMasterSkillTrades();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No skill trades found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Skill trades retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSkillTrade")]
        public IActionResult InsertMasterSkillTrade([FromBody] MasterSkillTradeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Skill trade data is required.", 400));
                if (entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid ID is required.", 400));
                if (string.IsNullOrEmpty(entity.TradeName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Trade Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSkillTrade(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Skill trade inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert skill trade. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSkillTrade")]
        public ActionResult<ApiResponse<string>> UpdateMasterSkillTrade([FromBody] MasterSkillTradeEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Skill trade data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.TradeName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Trade Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSkillTrade(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update skill trade.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Skill trade updated successfully.",
                        "Skill trade updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSkillTrade");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterSkillTrade/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSkillTrade(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSkillTrade(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Skill trade with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Skill trade soft deleted successfully.",
                        "Skill trade soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSkillTrade");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region Qualification Endpoints

        [HttpGet("GetMasterQualifications")]
        public IActionResult GetMasterQualifications()
        {
            try
            {
                var result = _master.GetMasterQualifications();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No qualifications found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Qualifications retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterQualification")]
        public IActionResult InsertMasterQualification([FromBody] MasterQualificationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Qualification data is required.", 400));
                if (entity.QualificationID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Qualification ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Qualification))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Qualification is required.", 400));
                if (string.IsNullOrEmpty(entity.QualificationGroup))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Qualification Group is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterQualification(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Qualification inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert qualification. QualificationID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #region Qualification Endpoints (Update & Delete as POST)

        [HttpPost]
        [Route("UpdateMasterQualification")]
        public ActionResult<ApiResponse<string>> UpdateMasterQualification(
            [FromBody] MasterQualificationEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Qualification data cannot be null.", 400));

            if (entity.QualificationID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Qualification ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Qualification))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Qualification is required.", 400));

            if (string.IsNullOrEmpty(entity.QualificationGroup))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Qualification Group is required.", 400));

            try
            {
                bool result = _master.UpdateMasterQualification(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update qualification.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Qualification updated successfully.",
                        "Qualification updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterQualification");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterQualification/{QualificationID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterQualification(int QualificationID)
        {
            if (QualificationID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Qualification ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterQualification(QualificationID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Qualification with ID {QualificationID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Qualification soft deleted successfully.",
                        "Qualification soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterQualification");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #endregion

        #region RestrictedKeyword Endpoints

        [HttpGet("GetMasterRestrictedKeywords")]
        public IActionResult GetMasterRestrictedKeywords()
        {
            try
            {
                var result = _master.GetMasterRestrictedKeywords();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No restricted keywords found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Restricted keywords retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterRestrictedKeyword")]
        public IActionResult InsertMasterRestrictedKeyword([FromBody] MasterRestrictedKeywordEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Keyword data is required.", 400));
                if (entity.KeyWordID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid KeyWord ID is required.", 400));
                if (string.IsNullOrEmpty(entity.KeyWordName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("KeyWord Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterRestrictedKeyword(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Restricted keyword inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert keyword. KeyWordID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterRestrictedKeyword")]
        public ActionResult<ApiResponse<string>> UpdateMasterRestrictedKeyword(
            [FromBody] MasterRestrictedKeywordEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Keyword data cannot be null.", 400));

            if (entity.KeyWordID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("KeyWord ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.KeyWordName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("KeyWord Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterRestrictedKeyword(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update keyword.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Restricted keyword updated successfully.",
                        "Restricted keyword updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterRestrictedKeyword");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterRestrictedKeyword/{KeyWordID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterRestrictedKeyword(int KeyWordID)
        {
            if (KeyWordID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("KeyWord ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterRestrictedKeyword(KeyWordID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Keyword with ID {KeyWordID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Restricted keyword soft deleted successfully.",
                        "Restricted keyword soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterRestrictedKeyword");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region VCApplication Endpoints

        [HttpGet("GetMasterVCApplications")]
        public IActionResult GetMasterVCApplications()
        {
            try
            {
                var result = _master.GetMasterVCApplications();
               
                return Ok(ApiResponse<object>.SuccessResponse(result ?? new List<MasterVCApplicationEntity>(), "VC applications retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterVCApplication")]
        public IActionResult InsertMasterVCApplication([FromBody] MasterVCApplicationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("VC application data is required.", 400));
                if (string.IsNullOrWhiteSpace(entity.VCApplication))
                    return BadRequest(ApiResponse<string>.ErrorResponse("VC Application name is required.", 400));

                int newId = _master.InsertMasterVCApplication(entity);
                if (newId > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newId, "VC application inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert VC application.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("UpdateMasterVCApplication")]
        public IActionResult UpdateMasterVCApplication([FromBody] MasterVCApplicationEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid VC application data.", 400));
                if (string.IsNullOrEmpty(entity.VCApplication))
                    return BadRequest(ApiResponse<string>.ErrorResponse("VC Application name is required.", 400));

                bool result = _master.UpdateMasterVCApplication(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "VC application updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update VC application.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("DeleteMasterVCApplication/{ID}")]
        public IActionResult DeleteMasterVCApplication(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.DeleteMasterVCApplication(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "VC application deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"VC Application with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region Master_Shift Endpoints

        [HttpGet("GetMasterShifts")]
        public IActionResult GetMasterShifts()
        {
            try
            {
                var result = _master.GetMasterShifts();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No shifts found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Shifts retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterShift")]
        public IActionResult InsertMasterShift([FromBody] MasterShiftEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Shift data is required.", 400));
                if (string.IsNullOrEmpty(entity.Shift))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Shift name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterShift(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Shift inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert shift.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterShift")]
        public ActionResult<ApiResponse<string>> UpdateMasterShift([FromBody] MasterShiftEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Shift data cannot be null.", 400));

            if (entity.ShiftID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Shift ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Shift))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Shift name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterShift(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update shift.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Shift updated successfully.",
                        "Shift updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterShift");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterShift/{ShiftID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterShift(int ShiftID)
        {
            if (ShiftID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Shift ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterShift(ShiftID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Shift with ID {ShiftID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Shift soft deleted successfully.",
                        "Shift soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterShift");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region TypeofInstitute Endpoints

        [HttpGet("GetMasterTypeofInstitutes")]
        public IActionResult GetMasterTypeofInstitutes()
        {
            try
            {
                var result = _master.GetMasterTypeofInstitutes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No type of institute records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Type of institute records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTypeofInstitute")]
        public IActionResult InsertMasterTypeofInstitute([FromBody] MasterTypeofInstituteEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Type of institute data is required.", 400));
                if (string.IsNullOrEmpty(entity.TypefInstitute))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Type of Institute name is required.", 400));
                if (entity.SeqNo <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Seq No is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterTypeofInstitute(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Type of institute inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert type of institute.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTypeofInstitute")]
        public IActionResult UpdateMasterTypeofInstitute([FromBody] MasterTypeofInstituteEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid type of institute data.", 400));
                if (string.IsNullOrEmpty(entity.TypefInstitute))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Type of Institute name is required.", 400));
                if (entity.SeqNo <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Seq No is required.", 400));

                bool result = _master.UpdateMasterTypeofInstitute(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Type of institute updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update type of institute.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTypeofInstitute/{ID}")]
        public IActionResult SoftDeleteMasterTypeofInstitute(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterTypeofInstitute(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Type of institute soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Type of institute with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingRemarkforUtilization Endpoints

        [HttpGet("GetMasterTrainingRemarkforUtilization")]
        public IActionResult GetMasterTrainingRemarkforUtilization()
        {
            try
            {
                var result = _master.GetMasterTrainingRemarkforUtilization();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No training remark for utilization records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training remark for utilization records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTrainingRemarkforUtilization")]
        public IActionResult InsertMasterTrainingRemarkforUtilization([FromBody] MasterTrainingRemarkforUtilizationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Remark data is required.", 400));
                if (string.IsNullOrEmpty(entity.RemarkforUtilization))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Remark for Utilization is required.", 400));

                entity.ID = _master.GetNextTrainingRemarkforUtilizationID();

                bool result = _master.InsertMasterTrainingRemarkforUtilization(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training remark for utilization inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert remark. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTrainingRemarkforUtilization")]
        public IActionResult UpdateMasterTrainingRemarkforUtilization([FromBody] MasterTrainingRemarkforUtilizationEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid remark data.", 400));
                if (string.IsNullOrEmpty(entity.RemarkforUtilization))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Remark for Utilization is required.", 400));

                bool result = _master.UpdateMasterTrainingRemarkforUtilization(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training remark for utilization updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update remark.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTrainingRemarkforUtilization/{ID}")]
        public IActionResult SoftDeleteMasterTrainingRemarkforUtilization(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterTrainingRemarkforUtilization(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training remark for utilization soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Remark with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingFeeCategory Endpoints

        [HttpGet("GetMasterTrainingFeeCategories")]
        public IActionResult GetMasterTrainingFeeCategories()
        {
            try
            {
                var result = _master.GetMasterTrainingFeeCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No training fee category records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training fee categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTrainingFeeCategory")]
        public IActionResult InsertMasterTrainingFeeCategory([FromBody] MasterTrainingFeeCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training fee category data is required.", 400));
                if (string.IsNullOrEmpty(entity.TrainingFeeCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training Fee Category is required.", 400));

                entity.IsActive = true;
                int newId = _master.InsertMasterTrainingFeeCategory(entity);
                if (newId > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newId, "Training fee category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert training fee category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterTrainingFeeCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterTrainingFeeCategory(
            [FromBody] MasterTrainingFeeCategoryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Training fee category data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.TrainingFeeCategory))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Training Fee Category is required.", 400));

            try
            {
                bool result = _master.UpdateMasterTrainingFeeCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update training fee category.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training fee category updated successfully.",
                        "Training fee category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingFeeCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterTrainingFeeCategory/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterTrainingFeeCategory(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterTrainingFeeCategory(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Training fee category with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training fee category soft deleted successfully.",
                        "Training fee category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingFeeCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingEquipment Endpoints

        [HttpGet("GetMasterTrainingEquipment")]
        public IActionResult GetMasterTrainingEquipment()
        {
            try
            {
                var result = _master.GetMasterTrainingEquipment();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training equipment retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTrainingEquipment")]
        public IActionResult InsertMasterTrainingEquipment([FromBody] MasterTrainingEquipmentEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Equipment data is required.", 400));
                if (string.IsNullOrEmpty(entity.NameofItem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Name of Item is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterTrainingEquipment(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training equipment inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert training equipment. Item may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterTrainingEquipment")]
        public ActionResult<ApiResponse<string>> UpdateMasterTrainingEquipment(
            [FromBody] MasterTrainingEquipmentEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.NameofItem))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Name of Item is required.", 400));

            try
            {
                bool result = _master.UpdateMasterTrainingEquipment(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update training equipment.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training equipment updated successfully.",
                        "Training equipment updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingEquipment");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterTrainingEquipment/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterTrainingEquipment(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterTrainingEquipment(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Equipment with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training equipment soft deleted successfully.",
                        "Training equipment soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingEquipment");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingCategory Endpoints

        [HttpGet("GetMasterTrainingCategories")]
        public IActionResult GetMasterTrainingCategories()
        {
            try
            {
                var result = _master.GetMasterTrainingCategories() ?? new List<MasterTrainingCategoryEntity>();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterTrainingCategory")]
        public IActionResult InsertMasterTrainingCategory([FromBody] MasterTrainingCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category data is required.", 400));
                if (string.IsNullOrEmpty(entity.TrainingCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training Category is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterTrainingCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert training category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTrainingCategory")]
        public IActionResult UpdateMasterTrainingCategory([FromBody] MasterTrainingCategoryEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid training category data.", 400));
                if (string.IsNullOrEmpty(entity.TrainingCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training Category is required.", 400));

                bool result = _master.UpdateMasterTrainingCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training category updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update training category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTrainingCategory/{ID}")]
        public IActionResult SoftDeleteMasterTrainingCategory(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Training Category ID.", 400));

                bool result = _master.SoftDeleteMasterTrainingCategory(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training category soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Training category with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingNameOfItem Endpoints

        [HttpGet("GetMasterTrainingNameOfItems")]
        public IActionResult GetMasterTrainingNameOfItems()
        {
            try
            {
                var result = _master.GetMasterTrainingNameOfItems();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No training items found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTrainingNameOfItem")]
        public IActionResult InsertMasterTrainingNameOfItem([FromBody] MasterTrainingNameOfItemEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item data is required.", 400));
                if (string.IsNullOrEmpty(entity.TrainingNameofItem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training Name of Item is required.", 400));

                entity.IsActive = true;
                int newID = _master.InsertMasterTrainingNameOfItem(entity);
                if (newID > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newID, "Training item inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert training item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterTrainingNameOfItem")]
        public ActionResult<ApiResponse<string>> UpdateMasterTrainingNameOfItem(
            [FromBody] MasterTrainingNameOfItemEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid item data.", 400));

            if (string.IsNullOrEmpty(entity.TrainingNameofItem))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Training Name of Item is required.", 400));

            try
            {
                bool result = _master.UpdateMasterTrainingNameOfItem(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update training item.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training item updated successfully.",
                        "Training item updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterTrainingNameOfItem");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterTrainingNameOfItem/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterTrainingNameOfItem(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterTrainingNameOfItem(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Item with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Training item soft deleted successfully.",
                        "Training item soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterTrainingNameOfItem");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region EquipmentCategory Endpoints

        [HttpGet("GetMasterEquipmentCategories")]
        public IActionResult GetMasterEquipmentCategories()
        {
            try
            {
                var result = _master.GetMasterEquipmentCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No equipment categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Equipment categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterEquipmentCategory")]
        public IActionResult InsertMasterEquipmentCategory([FromBody] MasterEquipmentCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Equipment category data is required.", 400));
                if (entity.EquipmentCategoryId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Equipment Category ID is required.", 400));
                if (string.IsNullOrEmpty(entity.EquipmentCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Equipment Category name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterEquipmentCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Equipment category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert equipment category. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterEquipmentCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterEquipmentCategory(
             [FromBody] MasterEquipmentCategoryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment category data cannot be null.", 400));

            if (entity.EquipmentCategoryId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment Category ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.EquipmentCategory))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment Category name is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.UpdateMasterEquipmentCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update equipment category.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Equipment category updated successfully.",
                        "Equipment category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterEquipmentCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterEquipmentCategory/{EquipmentCategoryId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterEquipmentCategory(int EquipmentCategoryId)
        {
            if (EquipmentCategoryId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Equipment Category ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterEquipmentCategory(EquipmentCategoryId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Equipment category with ID {EquipmentCategoryId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Equipment category soft deleted successfully.",
                        "Equipment category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterEquipmentCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }
        #endregion

        #region Master SectorialExpertise Endpoints

        [HttpGet("GetMasterSectorialExpertise")]
        public IActionResult GetMasterSectorialExpertise()
        {
            try
            {
                var result = _master.GetMasterSectorialExpertise();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No sectorial expertise records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Sectorial expertise records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSectorialExpertise")]
        public IActionResult InsertMasterSectorialExpertise([FromBody] MasterSectorialExpertiseEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sectorial expertise data is required.", 400));
                if (string.IsNullOrEmpty(entity.SectorialExpertiseName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sectorial Expertise Name is required.", 400));
                if (entity.SeqNo == null || entity.SeqNo <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Sequence No is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSectorialExpertise(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Sectorial expertise inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert sectorial expertise record.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterSectorialExpertise")]
        public ActionResult<ApiResponse<string>> UpdateMasterSectorialExpertise(
            [FromBody] MasterSectorialExpertiseEntity entity)
        {
            if (entity == null || entity.SectorialExpertiseID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid sectorial expertise data.", 400));

            if (string.IsNullOrEmpty(entity.SectorialExpertiseName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sectorial Expertise Name is required.", 400));

            if (entity.SeqNo == null || entity.SeqNo <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Sequence No is required.", 400));

            try
            {
                bool result = _master.UpdateMasterSectorialExpertise(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update sectorial expertise record.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sectorial expertise updated successfully.",
                        "Sectorial expertise updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterSectorialExpertise");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterSectorialExpertise/{SectorialExpertiseID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterSectorialExpertise(int SectorialExpertiseID)
        {
            if (SectorialExpertiseID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Sectorial Expertise ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterSectorialExpertise(SectorialExpertiseID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Record with ID {SectorialExpertiseID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sectorial expertise soft deleted successfully.",
                        "Sectorial expertise soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterSectorialExpertise");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region SubjectTypeExam Endpoints

        [HttpGet("GetMasterSubjectTypeExam")]
        public IActionResult GetMasterSubjectTypeExam()
        {
            try
            {
                var result = _master.GetMasterSubjectTypeExam();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No subject type exam records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Subject type exam records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSubjectTypeExam")]
        public IActionResult InsertMasterSubjectTypeExam([FromBody] SubjectTypeExamEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject type exam data is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectTypeExamName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Type Exam Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSubjectTypeExam(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject type exam inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert subject type exam.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateMasterSubjectTypeExam")]
        public IActionResult UpdateMasterSubjectTypeExam([FromBody] SubjectTypeExamEntity entity)
        {
            try
            {
                if (entity == null || entity.SubjectTypeExamID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid subject type exam data.", 400));
                if (string.IsNullOrEmpty(entity.SubjectTypeExamName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Type Exam Name is required.", 400));

                bool result = _master.UpdateMasterSubjectTypeExam(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject type exam updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update subject type exam.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("SoftDeleteMasterSubjectTypeExam/{SubjectTypeExamID}")]
        public IActionResult SoftDeleteMasterSubjectTypeExam(int SubjectTypeExamID)
        {
            try
            {
                if (SubjectTypeExamID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Subject Type Exam ID.", 400));

                bool result = _master.SoftDeleteMasterSubjectTypeExam(SubjectTypeExamID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject type exam soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Subject Type Exam with ID {SubjectTypeExamID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region PromoterStatus Endpoints

        [HttpGet("GetMasterPromoterStatuses")]
        public IActionResult GetMasterPromoterStatuses()
        {
            try
            {
                var result = _master.GetMasterPromoterStatuses();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoter status records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Promoter statuses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterPromoterStatus")]
        public IActionResult InsertMasterPromoterStatus([FromBody] MasterPromoterStatusEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Promoter status data is required.", 400));
                if (entity.PromoterStatusID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Promoter Status ID is required.", 400));
                if (string.IsNullOrEmpty(entity.PromoterStatus))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Promoter Status is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterPromoterStatus(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Promoter status inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert promoter status. PromoterStatusID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterPromoterStatus")]
        public ActionResult<ApiResponse<string>> UpdateMasterPromoterStatus(
    [FromBody] MasterPromoterStatusEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoter status data cannot be null.", 400));

            if (entity.PromoterStatusID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoter Status ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.PromoterStatus))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoter Status is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.UpdateMasterPromoterStatus(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update promoter status.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoter status updated successfully.",
                        "Promoter status updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterPromoterStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterPromoterStatus/{PromoterStatusID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterPromoterStatus(int PromoterStatusID)
        {
            if (PromoterStatusID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoter Status ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterPromoterStatus(PromoterStatusID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Promoter status with ID {PromoterStatusID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoter status soft deleted successfully.",
                        "Promoter status soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromoterStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region PromoterType Endpoints

        [HttpGet("GetMasterPromoterTypes")]
        public IActionResult GetMasterPromoterTypes()
        {
            try
            {
                var result = _master.GetMasterPromoterTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoter types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Promoter types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterPromoterType")]
        public IActionResult InsertMasterPromoterType([FromBody] MasterPromoterTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Promoter type data is required.", 400));
                if (entity.PromoterTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Promoter Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.PromoterType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Promoter Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterPromoterType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Promoter type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert promoter type. PromoterTypeID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterPromoterType")]
        public ActionResult<ApiResponse<string>> UpdateMasterPromoterType(
            [FromBody] MasterPromoterTypeEntity entity)
        {
            if (entity == null || entity.PromoterTypeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid promoter type data.", 400));

            if (string.IsNullOrEmpty(entity.PromoterType))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoter Type is required.", 400));

            try
            {
                bool result = _master.UpdateMasterPromoterType(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update promoter type.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoter type updated successfully.",
                        "Promoter type updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterPromoterType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterPromoterType/{PromoterTypeID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterPromoterType(int PromoterTypeID)
        {
            if (PromoterTypeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Promoter Type ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterPromoterType(PromoterTypeID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Promoter type with ID {PromoterTypeID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoter type soft deleted successfully.",
                        "Promoter type soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromoterType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region PromotingType Endpoints

        [HttpGet("GetMasterPromotingTypes")]
        public IActionResult GetMasterPromotingTypes()
        {
            try
            {
                var result = _master.GetMasterPromotingTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No promoting type records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Promoting types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterPromotingType")]
        public IActionResult InsertMasterPromotingType([FromBody] MasterPromotingTypeEntity entity)
        {
            try
            {
                if (entity.PromotingTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Promoting Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.PromotingType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Promoting Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterPromotingType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Promoting type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert promoting type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterPromotingType")]
        public ActionResult<ApiResponse<string>> UpdateMasterPromotingType(
    [FromBody] MasterPromotingTypeEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoting type data cannot be null.", 400));

            if (entity.PromotingTypeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoting Type ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.PromotingType))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoting Type is required.", 400));

            try
            {
                bool result = _master.UpdateMasterPromotingType(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update promoting type.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoting type updated successfully.",
                        "Promoting type updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterPromotingType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterPromotingType/{PromotingTypeID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterPromotingType(int PromotingTypeID)
        {
            if (PromotingTypeID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Promoting Type ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterPromotingType(PromotingTypeID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Promoting type with ID {PromotingTypeID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Promoting type soft deleted successfully.",
                        "Promoting type soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterPromotingType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region NotificationCategory Endpoints

        [HttpGet("GetMasterNotificationCategories")]
        public IActionResult GetMasterNotificationCategories()
        {
            try
            {
                var result = _master.GetMasterNotificationCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No notification categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Notification categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterNotificationCategory")]
        public IActionResult InsertMasterNotificationCategory([FromBody] MasterNotificationCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Notification category data is required.", 400));
                if (entity.NotificationCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Notification Category ID is required.", 400));
                if (string.IsNullOrEmpty(entity.NotificationCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Notification Category name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterNotificationCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Notification category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert notification category. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterNotificationCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterNotificationCategory(
            [FromBody] MasterNotificationCategoryEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Notification category data cannot be null.", 400));

            if (entity.NotificationCategoryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Notification Category ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.NotificationCategory))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Notification Category name is required.", 400));

            try
            {
                entity.IsActive = true;
                bool result = _master.UpdateMasterNotificationCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update notification category.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Notification category updated successfully.",
                        "Notification category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterNotificationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterNotificationCategory/{NotificationCategoryID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterNotificationCategory(int NotificationCategoryID)
        {
            if (NotificationCategoryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Notification Category ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterNotificationCategory(NotificationCategoryID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Notification category with ID {NotificationCategoryID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Notification category soft deleted successfully.",
                        "Notification category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterNotificationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterOtherInfra Endpoints

        [HttpGet("GetMasterOtherInfra")]
        public IActionResult GetMasterOtherInfra()
        {
            try
            {
                var result = _master.GetMasterOtherInfra();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No other infra records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Other infra records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterOtherInfra")]
        public IActionResult InsertMasterOtherInfra([FromBody] MasterOtherInfraEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Other infra data is required.", 400));
                if (entity.OtherInfraId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Other Infra ID is required.", 400));
                if (string.IsNullOrEmpty(entity.OtherInfra))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Other Infra name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterOtherInfra(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Other infra inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert record. OtherInfraId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterOtherInfra")]
        public ActionResult<ApiResponse<string>> UpdateMasterOtherInfra(
            [FromBody] MasterOtherInfraEntity entity)
        {
            if (entity == null || entity.OtherInfraId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid other infra data.", 400));

            if (string.IsNullOrEmpty(entity.OtherInfra))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Other Infra name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterOtherInfra(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update record.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Other infra updated successfully.",
                        "Other infra updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterOtherInfra");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterOtherInfra/{OtherInfraId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterOtherInfra(int OtherInfraId)
        {
            if (OtherInfraId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid Other Infra ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterOtherInfra(OtherInfraId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Record with ID {OtherInfraId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Other infra soft deleted successfully.",
                        "Other infra soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterOtherInfra");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterOtherInfraOptions Endpoints

        [HttpGet("GetMasterOtherInfraOptions")]
        public IActionResult GetMasterOtherInfraOptions()
        {
            try
            {
                var result = _master.GetMasterOtherInfraOptions();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No other infra records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Other infra records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterOtherInfraOptions")]
        public IActionResult InsertMasterOtherInfraOptions([FromBody] MasterOtherInfraOptionEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Other infra data is required.", 400));
                if (entity.OtherInfraId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Other Infra ID is required.", 400));
                if (string.IsNullOrEmpty(entity.OtherInfra))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Other Infra name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterOtherInfraOptions(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Other infra inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert other infra. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterOtherInfraOptions")]
        public ActionResult<ApiResponse<string>> UpdateMasterOtherInfraOptions(
            [FromBody] MasterOtherInfraOptionEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Other infra data cannot be null.", 400));

            if (entity.OtherInfraId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Other Infra ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.OtherInfra))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Other Infra name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterOtherInfraOptions(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update other infra.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Other infra updated successfully.",
                        "Other infra updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterOtherInfraOptions");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterOtherInfraOptions/{OtherInfraId}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterOtherInfraOptions(int OtherInfraId)
        {
            if (OtherInfraId <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Other Infra ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterOtherInfraOptions(OtherInfraId);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Other infra with ID {OtherInfraId} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Other infra soft deleted successfully.",
                        "Other infra soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterOtherInfraOptions");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region UserType Endpoints

        [HttpGet("GetMasterUserTypes")]
        public IActionResult GetMasterUserTypes()
        {
            try
            {
                var result = _master.GetMasterUserTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No user types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "User types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterUserType")]
        public IActionResult InsertMasterUserType([FromBody] MasterUserTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("User type data is required.", 400));
                if (entity.UserTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid User Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.UserType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("User Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterUserType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert user type. UserTypeID, UserType, or UserTypeCode may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterUserType")]
        public IActionResult UpdateMasterUserType([FromBody] MasterUserTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.UserTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user type data.", 400));
                if (string.IsNullOrEmpty(entity.UserType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("User Type is required.", 400));

                bool result = _master.UpdateMasterUserType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update user type. UserType or UserTypeCode may already be used by another record.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterUserType/{UserTypeID}")]
        public IActionResult SoftDeleteMasterUserType(int UserTypeID)
        {
            try
            {
                if (UserTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid User Type ID.", 400));

                bool result = _master.SoftDeleteMasterUserType(UserTypeID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"User type with ID {UserTypeID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region NSQFLevel Endpoints

        [HttpGet("GetMasterNSQFLevels")]
        public IActionResult GetMasterNSQFLevels()
        {
            try
            {
                var result = _master.GetMasterNSQFLevels();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No NSQF level records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "NSQF levels retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterNSQFLevel")]
        public IActionResult InsertMasterNSQFLevel([FromBody] MasterNSQFLevelEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("NSQF level data is required.", 400));
                if (string.IsNullOrEmpty(entity.NSQFLEVEL))
                    return BadRequest(ApiResponse<string>.ErrorResponse("NSQF Level is required.", 400));

                entity.IsActive = true;
                int newId = _master.InsertMasterNSQFLevel(entity);
                if (newId > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newId, "NSQF level inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert NSQF level.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPut("UpdateMasterNSQFLevel")]
        public IActionResult UpdateMasterNSQFLevel([FromBody] MasterNSQFLevelEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid NSQF level data.", 400));
                if (string.IsNullOrEmpty(entity.NSQFLEVEL))
                    return BadRequest(ApiResponse<string>.ErrorResponse("NSQF Level is required.", 400));

                bool result = _master.UpdateMasterNSQFLevel(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "NSQF level updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update NSQF level.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpDelete("SoftDeleteMasterNSQFLevel/{ID}")]
        public IActionResult SoftDeleteMasterNSQFLevel(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterNSQFLevel(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "NSQF level soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"NSQF level with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region ProjectConfiguration Endpoints

        [HttpGet("GetMasterProjectConfigurations")]
        public IActionResult GetMasterProjectConfigurations()
        {
            try
            {
                var result = _master.GetMasterProjectConfigurations();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No project configuration records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Project configuration records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterProjectConfiguration")]
        public IActionResult InsertMasterProjectConfiguration([FromBody] MasterProjectConfigurationEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Project configuration data is required.", 400));
                if (entity.RegionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Region ID is required.", 400));
                if (string.IsNullOrEmpty(entity.AppKey))
                    return BadRequest(ApiResponse<string>.ErrorResponse("App Key is required.", 400));
                if (string.IsNullOrEmpty(entity.AppKeyDetails))
                    return BadRequest(ApiResponse<string>.ErrorResponse("App Key Details is required.", 400));
                if (string.IsNullOrEmpty(entity.ControlRequired))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Control Required is required.", 400));

                entity.IsActive = true;
                entity.ModifiedBy = User?.Identity?.Name ?? "System";
                entity.ModifiedByIPAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString();

                bool result = _master.InsertMasterProjectConfiguration(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Project configuration inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert project configuration.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterProjectConfiguration")]
        public ActionResult<ApiResponse<string>> UpdateMasterProjectConfiguration(
    [FromBody] MasterProjectConfigurationEntity entity)
        {
            if (entity == null || entity.SeqNo <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid project configuration data.", 400));

            if (entity.RegionID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Region ID is required.", 400));

            if (string.IsNullOrEmpty(entity.AppKey))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("App Key is required.", 400));

            if (string.IsNullOrEmpty(entity.AppKeyDetails))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("App Key Details is required.", 400));

            if (string.IsNullOrEmpty(entity.ControlRequired))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Control Required is required.", 400));

            try
            {
                entity.ModifiedBy = User?.Identity?.Name ?? "System";
                entity.ModifiedByIPAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString();

                bool result = _master.UpdateMasterProjectConfiguration(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update project configuration.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Project configuration updated successfully.",
                        "Project configuration updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterProjectConfiguration");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterProjectConfiguration/{SeqNo}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterProjectConfiguration(int SeqNo)
        {
            if (SeqNo <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid SeqNo.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterProjectConfiguration(SeqNo);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Project configuration with SeqNo {SeqNo} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Project configuration soft deleted successfully.",
                        "Project configuration soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterProjectConfiguration");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationCategory Endpoints

        [HttpGet("GetMasterITISpecificationCategories")]
        public IActionResult GetMasterITISpecificationCategories()
        {
            try
            {
                var result = _master.GetMasterITISpecificationCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationCategory")]
        public IActionResult InsertMasterITISpecificationCategory([FromBody] MasterITISpecificationCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category data is required.", 400));
                if (string.IsNullOrEmpty(entity.CategoryName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationCategory")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationCategory(
            [FromBody] MasterITISpecificationCategoryEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid category data.", 400));

            if (string.IsNullOrEmpty(entity.CategoryName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Category Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationCategory(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update category.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification category updated successfully.",
                        "ITI specification category updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationCategory/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationCategory(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationCategory(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Category with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification category soft deleted successfully.",
                        "ITI specification category soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationCategory");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationGroup Endpoints

        [HttpGet("GetMasterITISpecificationGroups")]
        public IActionResult GetMasterITISpecificationGroups()
        {
            try
            {
                var result = _master.GetMasterITISpecificationGroups();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification groups found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification groups retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationGroup")]
        public IActionResult InsertMasterITISpecificationGroup([FromBody] MasterITISpecificationGroupEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Group data is required.", 400));
                if (string.IsNullOrEmpty(entity.GroupName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Group Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationGroup(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification group inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert group.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationGroup")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationGroup(
    [FromBody] MasterITISpecificationGroupEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Group data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Group ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.GroupName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Group Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationGroup(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update group.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Group updated successfully.",
                        "Group updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationGroup");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationGroup/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationGroup(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Group ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationGroup(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Group with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Group soft deleted successfully.",
                        "Group soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationGroup");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationItem Endpoints

        [HttpGet("GetMasterITISpecificationItems")]
        public IActionResult GetMasterITISpecificationItems()
        {
            try
            {
                var result = _master.GetMasterITISpecificationItems();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification items found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterITISpecificationItem")]
        public IActionResult InsertMasterITISpecificationItem([FromBody] MasterITISpecificationItemEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item data is required.", 400));
                if (string.IsNullOrEmpty(entity.NameofITem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Name of Item is required.", 400));

                entity.IsActive = true;

                bool result = _master.InsertMasterITISpecificationItem(entity);
                return result
                    ? Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification item inserted successfully."))
                    : BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationItem")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationItem(
    [FromBody] MasterITISpecificationItemEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Item data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Item ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.NameofITem))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Name of Item is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationItem(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update item.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification item updated successfully.",
                        "ITI specification item updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationItem");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationItem/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationItem(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationItem(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Item with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification item soft deleted successfully.",
                        "ITI specification item soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationItem");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationNameofItemAsperDGT Endpoints

        [HttpGet("GetMasterITISpecificationNameofItemAsperDGT")]
        public IActionResult GetMasterITISpecificationNameofItemAsperDGT()
        {
            try
            {
                var result = _master.GetMasterITISpecificationNameofItemAsperDGT();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification (as per DGT) items found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification (as per DGT) items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationNameofItemAsperDGT")]
        public IActionResult InsertMasterITISpecificationNameofItemAsperDGT([FromBody] MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item data is required.", 400));
                if (string.IsNullOrEmpty(entity.ItemAsperDGT))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item (as per DGT) is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationNameofItemAsperDGT(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification (as per DGT) item inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationNameofItemAsperDGT")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationNameofItemAsperDGT(
            [FromBody] MasterITISpecificationNameofItemAsperDGTEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid item data.", 400));

            if (string.IsNullOrEmpty(entity.ItemAsperDGT))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Item (as per DGT) is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationNameofItemAsperDGT(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update item.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification (as per DGT) item updated successfully.",
                        "ITI specification (as per DGT) item updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationNameofItemAsperDGT");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationNameofItemAsperDGT/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationNameofItemAsperDGT(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationNameofItemAsperDGT(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Item with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification (as per DGT) item soft deleted successfully.",
                        "ITI specification (as per DGT) item soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationNameofItemAsperDGT");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterSubject Endpoints

        [HttpGet("GetMasterSubjects")]
        public IActionResult GetMasterSubjects()
        {
            try
            {
                var result = _master.GetMasterSubjects();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No subjects found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Subjects retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSubject")]
        public IActionResult InsertMasterSubject([FromBody] MasterSubjectEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject data is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Name is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Code is required.", 400));
                if (entity.SubjectTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Subject Type is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterSubject(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert subject.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterSubject")]
        public IActionResult UpdateMasterSubject([FromBody] MasterSubjectEntity entity)
        {
            try
            {
                if (entity == null || entity.SubjectId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid subject data.", 400));
                if (string.IsNullOrEmpty(entity.SubjectName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Name is required.", 400));
                if (string.IsNullOrEmpty(entity.SubjectCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Subject Code is required.", 400));
                if (entity.SubjectTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Subject Type is required.", 400));

                bool result = _master.UpdateMasterSubject(entity);

                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update subject.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterSubject/{SubjectId}")]
        public IActionResult SoftDeleteMasterSubject(int SubjectId)
        {
            try
            {
                if (SubjectId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Subject ID.", 400));

                bool result = _master.SoftDeleteMasterSubject(SubjectId);

                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Subject soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Subject with ID {SubjectId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        #endregion

        #region ItemAsperDVET Endpoints

        [HttpGet("GetMasterItemAsperDVETs")]
        public IActionResult GetMasterItemAsperDVETs()
        {
            try
            {
                var result = _master.GetMasterItemAsperDVETs();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No item as per DVET records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Item as per DVET records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterItemAsperDVET")]
        public IActionResult InsertMasterItemAsperDVET([FromBody] MasterItemAsperDVETEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item data is required.", 400));
                if (string.IsNullOrEmpty(entity.ItemAsperDVET))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item as per DVET is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterItemAsperDVET(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Item as per DVET inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterItemAsperDVET")]
        public ActionResult<ApiResponse<string>> UpdateMasterItemAsperDVET(
            [FromBody] MasterItemAsperDVETEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Item data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.ItemAsperDVET))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Item as per DVET is required.", 400));

            try
            {
                bool result = _master.UpdateMasterItemAsperDVET(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update item as per DVET.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Item as per DVET updated successfully.",
                        "Item as per DVET updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterItemAsperDVET");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterItemAsperDVET/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterItemAsperDVET(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterItemAsperDVET(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Item as per DVET with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Item as per DVET soft deleted successfully.",
                        "Item as per DVET soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterItemAsperDVET");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationSector Endpoints

        [HttpGet("GetMasterITISpecificationSectors")]
        public IActionResult GetMasterITISpecificationSectors()
        {
            try
            {
                var result = _master.GetMasterITISpecificationSectors();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI Specification Sector records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI Specification Sector records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationSector")]
        public IActionResult InsertMasterITISpecificationSector([FromBody] MasterITISpecificationSectorEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sector data is required.", 400));
                if (string.IsNullOrEmpty(entity.SectorName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sector Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationSector(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI Specification Sector inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert sector.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationSector")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationSector(
            [FromBody] MasterITISpecificationSectorEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.SectorName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationSector(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update sector.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sector updated successfully.",
                        "Sector updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationSector/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationSector(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Sector ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationSector(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Sector with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Sector soft deleted successfully.",
                        "Sector soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSector");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationTrade Endpoints

        [HttpGet("GetMasterITISpecificationTrades")]
        public IActionResult GetMasterITISpecificationTrades()
        {
            try
            {
                var result = _master.GetMasterITISpecificationTrades();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification trades found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification trades retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationTrade")]
        public IActionResult InsertMasterITISpecificationTrade([FromBody] MasterITISpecificationTradeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Trade data is required.", 400));
                if (string.IsNullOrEmpty(entity.TradeName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Trade Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationTrade(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification trade inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert trade.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationTrade")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationTrade(
      [FromBody] MasterITISpecificationTradeEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Trade data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Trade ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.TradeName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Trade Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationTrade(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update trade.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification trade updated successfully.",
                        "ITI specification trade updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationTrade");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationTrade/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationTrade(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Trade ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationTrade(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Trade with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI specification trade soft deleted successfully.",
                        "ITI specification trade soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationTrade");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationUsage Endpoints

        [HttpGet("GetMasterITISpecificationUsages")]
        public IActionResult GetMasterITISpecificationUsages()
        {
            try
            {
                var result = _master.GetMasterITISpecificationUsages();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification usage records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification usage records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationUsage")]
        public IActionResult InsertMasterITISpecificationUsage([FromBody] MasterITISpecificationUsageEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Usage data is required.", 400));
                if (string.IsNullOrEmpty(entity.Usage))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Usage is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationUsage(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification usage inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert usage.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost]
        [Route("UpdateMasterITISpecificationUsage")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationUsage(
            [FromBody] MasterITISpecificationUsageEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Usage data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.Usage))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Usage is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationUsage(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update usage.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Usage updated successfully.",
                        "Usage updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationUsage");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationUsage/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationUsage(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationUsage(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Usage with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Usage soft deleted successfully.",
                        "Usage soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationUsage");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationSpecificationAsperDGT Endpoints

        [HttpGet("GetMasterITISpecificationSpecificationAsperDGTs")]
        public IActionResult GetMasterITISpecificationSpecificationAsperDGTs()
        {
            try
            {
                var result = _master.GetMasterITISpecificationSpecificationAsperDGTs();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No specification records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Specification records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationSpecificationAsperDGT")]
        public IActionResult InsertMasterITISpecificationSpecificationAsperDGT([FromBody] MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Specification data is required.", 400));
                if (string.IsNullOrEmpty(entity.SpecificationDGT))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Specification (as per DGT) is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationSpecificationAsperDGT(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Specification inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert specification.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationSpecificationAsperDGT")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationSpecificationAsperDGT(
     [FromBody] MasterITISpecificationSpecificationAsperDGTEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid specification data.", 400));

            if (string.IsNullOrEmpty(entity.SpecificationDGT))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Specification (as per DGT) is required.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationSpecificationAsperDGT(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update specification.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Specification updated successfully.",
                        "Specification updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSpecificationAsperDGT");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }


        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationSpecificationAsperDGT/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationSpecificationAsperDGT(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationSpecificationAsperDGT(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Specification with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Specification soft deleted successfully.",
                        "Specification soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSpecificationAsperDGT");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationSectorWise Endpoints

        [HttpGet("GetMasterITISpecificationSectorWise")]
        public IActionResult GetMasterITISpecificationSectorWise()
        {
            try
            {
                var result = _master.GetMasterITISpecificationSectorWise();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI Specification (Sector Wise) records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI Specification (Sector Wise) records retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationSectorWise")]
        public IActionResult InsertMasterITISpecificationSectorWise([FromBody] MasterITISpecificationSectorWiseEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Record data is required.", 400));
                if (entity.ItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Item ID is required.", 400));
                if (entity.GroupID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Group ID is required.", 400));
                if (entity.SectorID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Sector ID is required.", 400));
                if (entity.CategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Category ID is required.", 400));
                if (entity.EstimatedPrice < 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Estimated Price cannot be negative.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterITISpecificationSectorWise(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI Specification (Sector Wise) record inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert record.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterITISpecificationSectorWise")]
        public ActionResult<ApiResponse<string>> UpdateMasterITISpecificationSectorWise(
            [FromBody] MasterITISpecificationSectorWiseEntity entity)
        {
            if (entity == null || entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid record data.", 400));

            if (entity.ItemID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Item ID is required.", 400));

            if (entity.GroupID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Group ID is required.", 400));

            if (entity.SectorID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Sector ID is required.", 400));

            if (entity.CategoryID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Valid Category ID is required.", 400));

            if (entity.EstimatedPrice < 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Estimated Price cannot be negative.", 400));

            try
            {
                bool result = _master.UpdateMasterITISpecificationSectorWise(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update record.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI Specification (Sector Wise) record updated successfully.",
                        "ITI Specification (Sector Wise) record updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterITISpecificationSectorWise");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterITISpecificationSectorWise/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterITISpecificationSectorWise(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Invalid ID.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterITISpecificationSectorWise(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Record with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "ITI Specification (Sector Wise) record soft deleted successfully.",
                        "ITI Specification (Sector Wise) record soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterITISpecificationSectorWise");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region IgnoreWords Endpoints

        [HttpGet("GetMasterIgnoreWordsList")]
        public IActionResult GetMasterIgnoreWordsList()
        {
            try
            {
                var result = _master.GetMasterIgnoreWordsList();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ignore words found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Ignore words retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterIgnoreWord")]
        public IActionResult InsertMasterIgnoreWord([FromBody] MasterIgnoreWordEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ignore word data is required.", 400));

                // if (entity.ID <= 0)
                //     return BadRequest(ApiResponse<string>.ErrorResponse("Valid ID is required.", 400));

                if (string.IsNullOrEmpty(entity.WordsName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Words Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterIgnoreWord(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Ignore word inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert word. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterIgnoreWord")]
        public ActionResult<ApiResponse<string>> UpdateMasterIgnoreWord(
            [FromBody] MasterIgnoreWordEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Ignore word data cannot be null.", 400));

            if (entity.ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.WordsName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Words Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterIgnoreWord(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update ignore word.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Ignore word updated successfully.",
                        "Ignore word updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterIgnoreWord");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterIgnoreWord/{ID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterIgnoreWord(int ID)
        {
            if (ID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterIgnoreWord(ID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Word with ID {ID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Ignore word soft deleted successfully.",
                        "Ignore word soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterIgnoreWord");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region MasterFinancialYear Endpoints

        [HttpGet("GetMasterFinancialYears")]
        public IActionResult GetMasterFinancialYears()
        {
            try
            {
                var result = _master.GetMasterFinancialYears();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No financial years found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Financial years retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterFinancialYear")]
        public IActionResult InsertMasterFinancialYear([FromBody] MasterFinancialYearEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Financial year data is required.", 400));
                if (string.IsNullOrEmpty(entity.FinancialYear))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Financial Year is required.", 400));
                if (entity.StartDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Start Date is required.", 400));
                if (entity.EndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("End Date is required.", 400));
                if (entity.EndDate <= entity.StartDate)
                    return BadRequest(ApiResponse<string>.ErrorResponse("End Date must be after Start Date.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterFinancialYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Financial year inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert. Financial Year may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("UpdateMasterFinancialYear")]
        public IActionResult UpdateMasterFinancialYear([FromBody] MasterFinancialYearEntity entity)
        {
            try
            {
                if (entity == null || entity.FinancialYearID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid financial year data.", 400));
                if (string.IsNullOrEmpty(entity.FinancialYear))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Financial Year is required.", 400));
                if (entity.StartDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Start Date is required.", 400));
                if (entity.EndDate == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("End Date is required.", 400));
                if (entity.EndDate <= entity.StartDate)
                    return BadRequest(ApiResponse<string>.ErrorResponse("End Date must be after Start Date.", 400));

                bool result = _master.UpdateMasterFinancialYear(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Financial year updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update financial year.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SoftDeleteMasterFinancialYear/{FinancialYearID}")]
        public IActionResult SoftDeleteMasterFinancialYear(int FinancialYearID)
        {
            try
            {
                if (FinancialYearID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Financial Year ID.", 400));

                bool result = _master.SoftDeleteMasterFinancialYear(FinancialYearID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Financial year deleted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Cannot delete: record not found or it is the current financial year.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SetCurrentFinancialYear/{FinancialYearID}")]
        public IActionResult SetCurrentFinancialYear(int FinancialYearID)
        {
            try
            {
                if (FinancialYearID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Financial Year ID.", 400));

                bool result = _master.SetCurrentFinancialYear(FinancialYearID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Current financial year updated successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Financial year with ID {FinancialYearID} not found or inactive.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region User Endpoints

        [HttpGet("GetMasterUsers")]
        public IActionResult GetMasterUsers()
        {
            try
            {
                var result = _master.GetMasterUsers();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No users found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Users retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterUser")]
        public IActionResult InsertMasterUser([FromBody] MasterUserEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("User data is required.", 400));
                if (string.IsNullOrEmpty(entity.UserName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("User Name is required.", 400));
                if (string.IsNullOrEmpty(entity.UserLoginID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Login ID is required.", 400));
                if (string.IsNullOrEmpty(entity.UserPassword))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Password is required.", 400));

                bool result = _master.InsertMasterUser(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert user.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterUser")]
        public IActionResult UpdateMasterUser([FromBody] MasterUserEntity entity)
        {
            try
            {
                if (entity == null || entity.UserID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid user data.", 400));
                if (string.IsNullOrEmpty(entity.UserName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("User Name is required.", 400));
                if (string.IsNullOrEmpty(entity.UserLoginID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Login ID is required.", 400));

                bool result = _master.UpdateMasterUser(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update user.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterUser/{UserID}")]
        public IActionResult SoftDeleteMasterUser(int UserID)
        {
            try
            {
                if (UserID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid User ID.", 400));

                bool result = _master.SoftDeleteMasterUser(UserID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "User soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"User with ID {UserID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region BatchType Endpoints

        [HttpGet("GetMasterBatchTypes")]
        public IActionResult GetMasterBatchTypes()
        {
            try
            {
                var result = _master.GetMasterBatchTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No batch types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Batch types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBatchType")]
        public IActionResult InsertMasterBatchType([FromBody] MasterBatchTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch type data is required.", 400));
                if (entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid ID is required.", 400));
                if (string.IsNullOrEmpty(entity.BatchName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch Name is required.", 400));
                if (entity.AcademicYearID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Academic Year ID is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBatchType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert batch type. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterBatchType")]
        public IActionResult UpdateMasterBatchType([FromBody] MasterBatchTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid batch type data.", 400));
                if (string.IsNullOrEmpty(entity.BatchName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch Name is required.", 400));
                if (entity.AcademicYearID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Academic Year ID is required.", 400));

                bool result = _master.UpdateMasterBatchType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update batch type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

     
        [HttpPost("SoftDeleteMasterBatchType/{ID}")]
        public IActionResult SoftDeleteMasterBatchType(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterBatchType(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Batch type with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region BatchStatus Endpoints

        [HttpGet("GetMasterBatchStatuses")]
        public IActionResult GetMasterBatchStatuses()
        {
            try
            {
                var result = _master.GetMasterBatchStatuses();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No batch statuses found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Batch statuses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterBatchStatus")]
        public IActionResult InsertMasterBatchStatus([FromBody] MasterBatchStatusEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch status data is required.", 400));
                if (entity.BatchStatusID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Batch Status ID is required.", 400));
                if (string.IsNullOrEmpty(entity.BatchStatusName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Batch Status Name is required.", 400));

                entity.IsActive = true;
                bool result = _master.InsertMasterBatchStatus(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Batch status inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert batch status. BatchStatusID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("UpdateMasterBatchStatus")]
        public ActionResult<ApiResponse<string>> UpdateMasterBatchStatus([FromBody] MasterBatchStatusEntity entity)
        {
            if (entity == null)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Batch status data cannot be null.", 400));

            if (entity.BatchStatusID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Batch Status ID must be greater than zero.", 400));

            if (string.IsNullOrEmpty(entity.BatchStatusName))
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Batch Status Name is required.", 400));

            try
            {
                bool result = _master.UpdateMasterBatchStatus(entity);

                if (!result)
                    return BadRequest(ApiResponse<string>
                        .ErrorResponse("Failed to update batch status.", 400));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Batch status updated successfully.",
                        "Batch status updated successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterBatchStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        
        [HttpPost]
        [Route("SoftDeleteMasterBatchStatus/{BatchStatusID}")]
        public ActionResult<ApiResponse<string>> SoftDeleteMasterBatchStatus(int BatchStatusID)
        {
            if (BatchStatusID <= 0)
                return BadRequest(ApiResponse<string>
                    .ErrorResponse("Batch Status ID must be greater than zero.", 400));

            try
            {
                bool result = _master.SoftDeleteMasterBatchStatus(BatchStatusID);

                if (!result)
                    return NotFound(ApiResponse<string>
                        .ErrorResponse($"Batch status with ID {BatchStatusID} not found.", 404));

                return Ok(ApiResponse<string>
                    .SuccessResponse(
                        "Batch status soft deleted successfully.",
                        "Batch status soft deleted successfully.", 200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterBatchStatus");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>
                        .ErrorResponse($"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ConstructionType Endpoints

        [HttpGet("GetMasterConstructionTypes")]
        public IActionResult GetMasterConstructionTypes()
        {
            try
            {
                var result = _master.GetMasterConstructionTypes();

                if (result == null || result.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse(
                        "No construction types found.", 404));
                }

                return Ok(ApiResponse<object>.SuccessResponse(
                    result,
                    "Construction types retrieved successfully."));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMasterConstructionTypes");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterConstructionType")]
        public IActionResult InsertMasterConstructionType([FromBody] MasterConstructionTypeEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction type data is required.", 400));
                }

                if (string.IsNullOrWhiteSpace(entity.ConstructionType))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction Type is required.", 400));
                }

                entity.IsActive = true;

                bool result = _master.InsertMasterConstructionType(entity);

                if (result)
                {
                    return Ok(ApiResponse<bool>.SuccessResponse(
                        true,
                        "Construction type inserted successfully."));
                }

                return BadRequest(ApiResponse<string>.ErrorResponse(
                    "Failed to insert construction type. It may already exist.",
                    400));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "InsertMasterConstructionType");
                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterConstructionType")]
        public IActionResult UpdateMasterConstructionType([FromBody] MasterConstructionTypeEntity entity)
        {
            try
            {
                if (entity == null)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction type data cannot be null.", 400));
                }

                if (entity.ConstructionTypeId <= 0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction Type ID must be greater than zero.", 400));
                }

                if (string.IsNullOrWhiteSpace(entity.ConstructionType))
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction Type is required.", 400));
                }

                bool result = _master.UpdateMasterConstructionType(entity);

                if (!result)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Failed to update construction type.", 400));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Construction type updated successfully.",
                    "Construction type updated successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "UpdateMasterConstructionType");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterConstructionType/{constructionTypeId}")]
        public IActionResult SoftDeleteMasterConstructionType(int constructionTypeId)
        {
            try
            {
                if (constructionTypeId <= 0)
                {
                    return BadRequest(ApiResponse<string>.ErrorResponse(
                        "Construction Type ID must be greater than zero.", 400));
                }

                bool result = _master.SoftDeleteMasterConstructionType(constructionTypeId);

                if (!result)
                {
                    return NotFound(ApiResponse<string>.ErrorResponse(
                        $"Construction type with ID {constructionTypeId} not found.",
                        404));
                }

                return Ok(ApiResponse<string>.SuccessResponse(
                    "Construction type soft deleted successfully.",
                    "Construction type soft deleted successfully.",
                    200));
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SoftDeleteMasterConstructionType");

                return StatusCode(StatusCodes.Status500InternalServerError,
                    ApiResponse<string>.ErrorResponse(
                        $"Internal server error: {ex.Message}", 500));
            }
        }

        #endregion

        #region ExamType Endpoints

        [HttpGet("GetMasterExamTypes")]
        public IActionResult GetMasterExamTypes()
        {
            try
            {
                var result = _master.GetMasterExamTypes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No exam types found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Exam types retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterExamType")]
        public IActionResult InsertMasterExamType([FromBody] MasterExamTypeEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Exam type data is required.", 400));
                if (entity.ExamTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Exam Type ID is required.", 400));
                if (string.IsNullOrEmpty(entity.ExamType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Exam Type name is required.", 400));

                bool result = _master.InsertMasterExamType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Exam type inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert exam type. ExamTypeID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterExamType")]
        public IActionResult UpdateMasterExamType([FromBody] MasterExamTypeEntity entity)
        {
            try
            {
                if (entity == null || entity.ExamTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid exam type data.", 400));
                if (string.IsNullOrEmpty(entity.ExamType))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Exam Type name is required.", 400));

                bool result = _master.UpdateMasterExamType(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Exam type updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update exam type.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterExamType/{ExamTypeID}")]
        public IActionResult SoftDeleteMasterExamType(int ExamTypeID)
        {
            try
            {
                if (ExamTypeID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Exam Type ID.", 400));

                bool result = _master.SoftDeleteMasterExamType(ExamTypeID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Exam type soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Exam type with ID {ExamTypeID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region Religion Endpoints

        [HttpGet("GetMasterReligions")]
        public IActionResult GetMasterReligions()
        {
            try
            {
                var result = _master.GetMasterReligions();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No religions found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Religions retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterReligion")]
        public IActionResult InsertMasterReligion([FromBody] MasterReligionEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Religion data is required.", 400));
                if (entity.ReligionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Religion ID is required.", 400));
                if (string.IsNullOrEmpty(entity.Religion))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Religion name is required.", 400));

                bool result = _master.InsertMasterReligion(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Religion inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert religion. Name may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterReligion")]
        public IActionResult UpdateMasterReligion([FromBody] MasterReligionEntity entity)
        {
            try
            {
                if (entity == null || entity.ReligionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid religion data.", 400));
                if (string.IsNullOrEmpty(entity.Religion))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Religion name is required.", 400));

                bool result = _master.UpdateMasterReligion(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Religion updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update religion.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterReligion/{ReligionID}")]
        public IActionResult SoftDeleteMasterReligion(int ReligionID)
        {
            try
            {
                if (ReligionID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Religion ID.", 400));

                bool result = _master.SoftDeleteMasterReligion(ReligionID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Religion soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Religion with ID {ReligionID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region SuccessStories Endpoints

        [HttpGet("GetMasterSuccessStories")]
        public IActionResult GetMasterSuccessStories()
        {
            try
            {
                var result = _master.GetMasterSuccessStories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No success stories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Success stories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterSuccessStory")]
        public IActionResult InsertMasterSuccessStory([FromBody] MasterSuccessStoriesEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Success story data is required.", 400));
                if (string.IsNullOrEmpty(entity.FirstName) || string.IsNullOrEmpty(entity.LastName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("First name and last name are required.", 400));
                if (string.IsNullOrEmpty(entity.CandidateProfileID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Candidate Profile ID is required.", 400));

                entity.CreatedBy = User?.Identity?.Name ?? "System";
                entity.CreatedByIPAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "";

                int newId = _master.InsertMasterSuccessStory(entity);
                if (newId > 0)
                    return Ok(ApiResponse<int>.SuccessResponse(newId, "Success story inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert success story.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterSuccessStory")]
        public IActionResult UpdateMasterSuccessStory([FromBody] MasterSuccessStoriesEntity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid success story data.", 400));
                if (string.IsNullOrEmpty(entity.FirstName) || string.IsNullOrEmpty(entity.LastName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("First name and last name are required.", 400));

                entity.ModifiedBy = User?.Identity?.Name ?? "System";
                entity.ModifiedByIPAddress = HttpContext?.Connection?.RemoteIpAddress?.ToString() ?? "";

                bool result = _master.UpdateMasterSuccessStory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Success story updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update success story.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterSuccessStory/{ID}")]
        public IActionResult SoftDeleteMasterSuccessStory(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterSuccessStory(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Success story soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Success story with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region ITISpecificationItemV2 Endpoints

        [HttpGet("GetMasterITISpecificationItemsV2")]
        public IActionResult GetMasterITISpecificationItemsV2()
        {
            try
            {
                var result = _master.GetMasterITISpecificationItemsV2();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No ITI specification items found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "ITI specification items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterITISpecificationItemV2")]
        public IActionResult InsertMasterITISpecificationItemV2([FromBody] MasterITISpecificationItemV2Entity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("ITI specification item data is required.", 400));
                if (string.IsNullOrEmpty(entity.NameofITem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item name is required.", 400));
                if (string.IsNullOrEmpty(entity.ItemCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item code is required.", 400));

                bool result = _master.InsertMasterITISpecificationItemV2(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification item inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert ITI specification item. ID may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterITISpecificationItemV2")]
        public IActionResult UpdateMasterITISpecificationItemV2([FromBody] MasterITISpecificationItemV2Entity entity)
        {
            try
            {
                if (entity == null || entity.ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ITI specification item data.", 400));
                if (string.IsNullOrEmpty(entity.NameofITem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item name is required.", 400));
                if (string.IsNullOrEmpty(entity.ItemCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Item code is required.", 400));

                bool result = _master.UpdateMasterITISpecificationItemV2(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification item updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update ITI specification item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterITISpecificationItemV2/{ID}")]
        public IActionResult SoftDeleteMasterITISpecificationItemV2(int ID)
        {
            try
            {
                if (ID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid ID.", 400));

                bool result = _master.SoftDeleteMasterITISpecificationItemV2(ID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "ITI specification item soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"ITI specification item with ID {ID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region InstituteCategory Endpoints

        [HttpGet("GetMasterInstituteCategories")]
        public IActionResult GetMasterInstituteCategories()
        {
            try
            {
                var result = _master.GetMasterInstituteCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No institute categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Institute categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }
        [HttpPost("InsertMasterInstituteCategory")]
        public IActionResult InsertMasterInstituteCategory([FromBody] MasterInstituteCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Institute category data is required.", 400));
                if (string.IsNullOrEmpty(entity.Category))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category name is required.", 400));
                if (string.IsNullOrEmpty(entity.CategoryCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category Code is required.", 400));

                bool result = _master.InsertMasterInstituteCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert institute category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterInstituteCategory")]
        public IActionResult UpdateMasterInstituteCategory([FromBody] MasterInstituteCategoryEntity entity)
        {
            try
            {
                if (entity == null || entity.CategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute category data.", 400));
                if (string.IsNullOrEmpty(entity.Category))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category name is required.", 400));
                if (string.IsNullOrEmpty(entity.CategoryCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Category Code is required.", 400));

                bool result = _master.UpdateMasterInstituteCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute category updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update institute category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterInstituteCategory/{CategoryID}")]
        public IActionResult SoftDeleteMasterInstituteCategory(int CategoryID)
        {
            try
            {
                if (CategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Category ID.", 400));

                bool result = _master.SoftDeleteMasterInstituteCategory(CategoryID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute category soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Institute category with ID {CategoryID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region InstituteOwnership Endpoints

        [HttpGet("GetMasterInstituteOwnerships")]
        public IActionResult GetMasterInstituteOwnerships()
        {
            try
            {
                var result = _master.GetMasterInstituteOwnerships();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No institute ownerships found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Institute ownerships retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet("GetNextSeqNoInstituteOwnership")]
        public IActionResult GetNextSeqNoInstituteOwnership()
        {
            try
            {
                var result = _master.GetNextSeqNoInstituteOwnership();
                return Ok(ApiResponse<object>.SuccessResponse(result, "Next Seq No retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterInstituteOwnership")]
        public IActionResult InsertMasterInstituteOwnership([FromBody] MasterInstituteOwnershipEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Institute ownership data is required.", 400));
                if (string.IsNullOrEmpty(entity.OwnershipName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Name is required.", 400));
                if (string.IsNullOrEmpty(entity.OwnershipCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Code is required.", 400));

                bool result = _master.InsertMasterInstituteOwnership(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute ownership inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert institute ownership.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterInstituteOwnership")]
        public IActionResult UpdateMasterInstituteOwnership([FromBody] MasterInstituteOwnershipEntity entity)
        {
            try
            {
                if (entity == null || entity.OwnershipID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid institute ownership data.", 400));
                if (string.IsNullOrEmpty(entity.OwnershipName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Name is required.", 400));
                if (string.IsNullOrEmpty(entity.OwnershipCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Ownership Code is required.", 400));

                bool result = _master.UpdateMasterInstituteOwnership(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute ownership updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update institute ownership.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterInstituteOwnership/{OwnershipID}")]
        public IActionResult SoftDeleteMasterInstituteOwnership(int OwnershipID)
        {
            try
            {
                if (OwnershipID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Ownership ID.", 400));

                bool result = _master.SoftDeleteMasterInstituteOwnership(OwnershipID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Institute ownership soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Institute ownership with ID {OwnershipID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region InfraCategory Endpoints

        [HttpGet("GetMasterInfraCategories")]
        public IActionResult GetMasterInfraCategories()
        {
            try
            {
                var result = _master.GetMasterInfraCategories();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No infra categories found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Infra categories retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterInfraCategory")]
        public IActionResult InsertMasterInfraCategory([FromBody] MasterInfraCategoryEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra category data is required.", 400));
                if (string.IsNullOrEmpty(entity.InfraCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra Category name is required.", 400));

                bool result = _master.InsertMasterInfraCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra category inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert infra category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterInfraCategory")]
        public IActionResult UpdateMasterInfraCategory([FromBody] MasterInfraCategoryEntity entity)
        {
            try
            {
                if (entity == null || entity.InfraCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid infra category data.", 400));
                if (string.IsNullOrEmpty(entity.InfraCategory))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra Category name is required.", 400));

                bool result = _master.UpdateMasterInfraCategory(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra category updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update infra category.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterInfraCategory/{InfraCategoryID}")]
        public IActionResult SoftDeleteMasterInfraCategory(int InfraCategoryID)
        {
            try
            {
                if (InfraCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Infra Category ID.", 400));

                bool result = _master.SoftDeleteMasterInfraCategory(InfraCategoryID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra category soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Infra category with ID {InfraCategoryID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region InfraItem Endpoints

        [HttpGet("GetMasterInfraItems")]
        public IActionResult GetMasterInfraItems()
        {
            try
            {
                var result = _master.GetMasterInfraItems();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No infra items found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Infra items retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterInfraItem")]
        public IActionResult InsertMasterInfraItem([FromBody] MasterInfraItemEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra item data is required.", 400));
                if (entity.InfraItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Infra Item ID is required.", 400));
                if (string.IsNullOrEmpty(entity.InfraItem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra Item name is required.", 400));
                if (entity.InfraCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Infra Category ID is required.", 400));

                bool result = _master.InsertMasterInfraItem(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra item inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert infra item. InfraItemID may already exist or InfraCategoryID is invalid.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterInfraItem")]
        public IActionResult UpdateMasterInfraItem([FromBody] MasterInfraItemEntity entity)
        {
            try
            {
                if (entity == null || entity.InfraItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid infra item data.", 400));
                if (string.IsNullOrEmpty(entity.InfraItem))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Infra Item name is required.", 400));
                if (entity.InfraCategoryID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Infra Category ID is required.", 400));

                bool result = _master.UpdateMasterInfraItem(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra item updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update infra item.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterInfraItem/{InfraItemID}")]
        public IActionResult SoftDeleteMasterInfraItem(int InfraItemID)
        {
            try
            {
                if (InfraItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Infra Item ID.", 400));

                bool result = _master.SoftDeleteMasterInfraItem(InfraItemID);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Infra item soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Infra item with ID {InfraItemID} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region TrainingEquipmentList Endpoints

        [HttpGet("GetMasterTrainingEquipmentList")]
        public IActionResult GetMasterTrainingEquipmentList()
        {
            try
            {
                var result = _master.GetMasterTrainingEquipmentList();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No training equipment records found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "Training equipment list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterTrainingEquipmentList")]
        public IActionResult InsertMasterTrainingEquipmentList([FromBody] MasterTrainingEquipmentListEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training equipment data is required.", 400));
                if (entity.EquipmentId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Equipment ID is required.", 400));
                if (entity.CourseID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course is required.", 400));
                if (entity.ItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Item is required.", 400));
                if (entity.EquipmentCategoryId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Equipment Category is required.", 400));
                if (entity.UtilizationRemarksID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Utilization Remarks is required.", 400));
                if (entity.RequiredPerUnit <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Required Per Unit must be greater than 0.", 400));

                bool result = _master.InsertMasterTrainingEquipmentList(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training equipment inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert training equipment. EquipmentId may already exist.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateMasterTrainingEquipmentList")]
        public IActionResult UpdateMasterTrainingEquipmentList([FromBody] MasterTrainingEquipmentListEntity entity)
        {
            try
            {
                if (entity == null || entity.EquipmentId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid training equipment data.", 400));
                if (entity.CourseID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Course is required.", 400));
                if (entity.ItemID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Item is required.", 400));
                if (entity.EquipmentCategoryId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Equipment Category is required.", 400));
                if (entity.UtilizationRemarksID <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Valid Utilization Remarks is required.", 400));
                if (entity.RequiredPerUnit <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Required Per Unit must be greater than 0.", 400));

                bool result = _master.UpdateMasterTrainingEquipmentList(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training equipment updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update training equipment.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterTrainingEquipmentList/{EquipmentId}")]
        public IActionResult SoftDeleteMasterTrainingEquipmentList(int EquipmentId)
        {
            try
            {
                if (EquipmentId <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Equipment ID.", 400));

                bool result = _master.SoftDeleteMasterTrainingEquipmentList(EquipmentId);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "Training equipment soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"Training equipment with ID {EquipmentId} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region OBWCCourse Endpoints

        [HttpGet("GetMasterOBWCCourses")]
        public IActionResult GetMasterOBWCCourses()
        {
            try
            {
                var result = _master.GetMasterOBWCCourses();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No OBWC courses found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "OBWC courses retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertMasterOBWCCourse")]
        public IActionResult InsertMasterOBWCCourse([FromBody] MasterOBWCCourseEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("OBWC course data is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Code is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Name is required.", 400));
                if (string.IsNullOrEmpty(entity.Sector))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Sector is required.", 400));

                bool result = _master.InsertMasterOBWCCourse(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC course inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert OBWC course.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }   

        [HttpPost("UpdateMasterOBWCCourse")]
        public IActionResult UpdateMasterOBWCCourse([FromBody] MasterOBWCCourseEntity entity)
        {
            try
            {
                if (entity == null || entity.Id <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid OBWC course data.", 400));
                if (string.IsNullOrEmpty(entity.CourseCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Code is required.", 400));
                if (string.IsNullOrEmpty(entity.CourseName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Course Name is required.", 400));

                bool result = _master.UpdateMasterOBWCCourse(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC course updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update OBWC course.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteMasterOBWCCourse/{Id}")]
        public IActionResult SoftDeleteMasterOBWCCourse(int Id)
        {
            try
            {
                if (Id <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Id.", 400));

                bool result = _master.SoftDeleteMasterOBWCCourse(Id);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC course soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"OBWC course with Id {Id} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion

        #region OBWCInstitute Endpoints

        [HttpGet("GetAllOBWCInstitutes")]
        public IActionResult GetAllOBWCInstitutes()
        {
            try
            {
                var result = _master.GetAllOBWCInstitutes();
                if (result == null || result.Count == 0)
                    return NotFound(ApiResponse<object>.ErrorResponse("No OBWC institutes found.", 404));
                return Ok(ApiResponse<object>.SuccessResponse(result, "OBWC institutes retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("InsertOBWCInstitute")]
        public IActionResult InsertOBWCInstitute([FromBody] MasterOBWCInstituteEntity entity)
        {
            try
            {
                if (entity == null)
                    return BadRequest(ApiResponse<string>.ErrorResponse("OBWC institute data is required.", 400));
                if (string.IsNullOrEmpty(entity.NameasperBOCWPortal))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Name as per BOCW Portal is required.", 400));
                if (string.IsNullOrEmpty(entity.InstituteCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Institute Code is required.", 400));
                if (string.IsNullOrEmpty(entity.TrainingPartner))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Training Partner is required.", 400));
                if (string.IsNullOrEmpty(entity.CityVillage))
                    return BadRequest(ApiResponse<string>.ErrorResponse("City/Village is required.", 400));
                if (string.IsNullOrEmpty(entity.District))
                    return BadRequest(ApiResponse<string>.ErrorResponse("District is required.", 400));
                if (string.IsNullOrEmpty(entity.FirstName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("First Name is required.", 400));
                if (string.IsNullOrEmpty(entity.LastName))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Last Name is required.", 400));
                if (string.IsNullOrEmpty(entity.PrimaryMobileNumber))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Primary Mobile Number is required.", 400));
                if (string.IsNullOrEmpty(entity.EMailID))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Email ID is required.", 400));

                bool result = _master.InsertOBWCInstitute(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC institute inserted successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to insert OBWC institute.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("UpdateOBWCInstitute")]
        public IActionResult UpdateOBWCInstitute([FromBody] MasterOBWCInstituteEntity entity)
        {
            try
            {
                if (entity == null || entity.Id <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid OBWC institute data.", 400));
                if (string.IsNullOrEmpty(entity.NameasperBOCWPortal))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Name as per BOCW Portal is required.", 400));
                if (string.IsNullOrEmpty(entity.InstituteCode))
                    return BadRequest(ApiResponse<string>.ErrorResponse("Institute Code is required.", 400));

                bool result = _master.UpdateOBWCInstitute(entity);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC institute updated successfully."));
                else
                    return BadRequest(ApiResponse<string>.ErrorResponse("Failed to update OBWC institute.", 400));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost("SoftDeleteOBWCInstitute/{Id}")]
        public IActionResult SoftDeleteOBWCInstitute(int Id)
        {
            try
            {
                if (Id <= 0)
                    return BadRequest(ApiResponse<string>.ErrorResponse("Invalid Id.", 400));

                bool result = _master.SoftDeleteOBWCInstitute(Id);
                if (result)
                    return Ok(ApiResponse<bool>.SuccessResponse(result, "OBWC institute soft deleted successfully."));
                else
                    return NotFound(ApiResponse<string>.ErrorResponse($"OBWC institute with Id {Id} not found.", 404));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<string>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        #endregion


    }
}
