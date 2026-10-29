using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Portal.Entities;
using Portal.Entities.Menu;

namespace Portal.Business.Interface.Menu
{
    public interface IMenu
    {
        DataTable GetMenu(short RegionID, int UserTypeID, string UserLoginID, string Language = "");
        DataTable GetLinksList(string Directory);
        string SaveLinksActiveStatus(List<LinkEntity> ListEntity);
        LinkEntity GetLinkDetails(int LinkID);
        string SaveLinkDetails(LinkEntity entity);
        DataTable GetGroupsList(short RegionID, int UserTypeID);
        DataTable GetMenusList(short RegionID, int UserTypeID, int ParentMenuID);
        DataTable GetAvailableMenusList(short RegionID, int UserTypeID, int ParentMenuID);
        string SaveMenusActiveStatus(List<MenuEntity> ListEntity);
        MenuEntity GetMenuDetails(int MenuID);
        string SaveMenuDetails(MenuEntity entity);
    }
}
