using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Portal.Business.Interface.Menu;
using Portal.Business.Worker.Base;
using Portal.Entities.Menu;
using Portal.Entities.ResponseBody;

namespace Portal.Server.Controllers.Menu
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenu _menu;
        public MenuController(IMenu menuService)
        {
            _menu = menuService;
        }

        [HttpGet]
        [Route("GetMenu")]
        public IActionResult GetMenu(short RegionID, int UserTypeID, string UserLoginID, string Language = "")
        {
            try
            {
                var result = _menu.GetMenu(RegionID, UserTypeID, UserLoginID, Language);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No menu records found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Menu retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetLinksList")]
        public IActionResult GetLinksList(string Directory)
        {
            try
            {
                var result = _menu.GetLinksList(Directory);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No links found for the given directory.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Links list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveLinksActiveStatus")]
        public IActionResult SaveLinksActiveStatus([FromBody] List<LinkEntity> ListEntity)
        {
            try
            {
                var result = _menu.SaveLinksActiveStatus(ListEntity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Links active status updated successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetLinkDetails")]
        public IActionResult GetLinkDetails(int LinkID)
        {
            try
            {
                var result = _menu.GetLinkDetails(LinkID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Link not found.", 404));
                }
                return Ok(ApiResponse<LinkEntity>.SuccessResponse(result, "Link details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveLinkDetails")]
        public IActionResult SaveLinkDetails([FromBody] LinkEntity entity)
        {
            try
            {
                var result = _menu.SaveLinkDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Link details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetGroupsList")]
        public IActionResult GetGroupsList(short RegionID, int UserTypeID)
        {
            try
            {
                var result = _menu.GetGroupsList(RegionID, UserTypeID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No groups found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Groups list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMenusList")]
        public IActionResult GetMenusList(short RegionID, int UserTypeID, int ParentMenuID)
        {
            try
            {
                var result = _menu.GetMenusList(RegionID, UserTypeID, ParentMenuID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No menus found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Menus list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetAvailableMenusList")]
        public IActionResult GetAvailableMenusList(short RegionID, int UserTypeID, int ParentMenuID)
        {
            try
            {
                var result = _menu.GetAvailableMenusList(RegionID, UserTypeID, ParentMenuID);
                var serializableData = BaseWorker.ConvertDataTableToList(result);
                if (result == null || result.Rows.Count == 0)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("No available menus found.", 404));
                }
                return Ok(ApiResponse<object>.SuccessResponse(serializableData, "Available menus list retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveMenusActiveStatus")]
        public IActionResult SaveMenusActiveStatus([FromBody] List<MenuEntity> ListEntity)
        {
            try
            {
                var result = _menu.SaveMenusActiveStatus(ListEntity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Menus active status updated successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpGet]
        [Route("GetMenuDetails")]
        public IActionResult GetMenuDetails(int MenuID)
        {
            try
            {
                var result = _menu.GetMenuDetails(MenuID);
                if (result == null)
                {
                    return NotFound(ApiResponse<object>.ErrorResponse("Menu not found.", 404));
                }
                return Ok(ApiResponse<MenuEntity>.SuccessResponse(result, "Menu details retrieved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }

        [HttpPost]
        [Route("SaveMenuDetails")]
        public IActionResult SaveMenuDetails([FromBody] MenuEntity entity)
        {
            try
            {
                var result = _menu.SaveMenuDetails(entity);
                return Ok(ApiResponse<string>.SuccessResponse(result, "Menu details saved successfully."));
            }
            catch (Exception ex)
            {
                return StatusCode(500, ApiResponse<object>.ErrorResponse($"An error occurred: {ex.Message}", 500));
            }
        }



    }
}
