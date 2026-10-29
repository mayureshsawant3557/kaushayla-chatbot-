using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Portal.Data.Source;
using Portal.Entities;
using System.Data;
using System.Xml;
using System.Xml.Serialization;
using System.IO;
using System.Threading.Tasks;
using Portal.Entities.Menu;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetMenu(Int16 RegionID, Int32 UserTypeID, string UserLoginID, string Language)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@UserLoginID", UserLoginID);
            param.Add("@Language", Language);

            return _dbAccess.GetDataTable("Menu_GetMenu", param);
        }
        public DataTable GetLinksList(string Directory)
        {
            var param = new Dictionary<string, object>();

            param.Add("@Directory", Directory);

            return _dbAccess.GetDataTable("Menu_GetLinksList", param);
        }
        public string SaveLinksActiveStatus(List<LinkEntity> ListEntity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LinksXML", GetXML(ListEntity));

            return _dbAccess.ExecuteScalar("Menu_SaveLinksActiveStatus", param).ToString();
        }
        public DataTable GetLinkDetails(Int32 LinkID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LinkID", LinkID);

            return _dbAccess.GetDataTable("Menu_GetLinkDetails", param);
        }
        public string SaveLinkDetails(LinkEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@LinkID", entity.LinkID);
            param.Add("@LinkName", entity.LinkName);
            param.Add("@LinkNameMarathi", entity.LinkNameMarathi);
            param.Add("@LinkDescription", entity.LinkDescription);
            param.Add("@LinkDescriptionMarathi", entity.LinkDescriptionMarathi);
            param.Add("@LinkURL", entity.LinkURL);
            param.Add("@LinkType", entity.LinkType);
            param.Add("@Directory", entity.Directory);
            param.Add("@PageName", entity.PageName);
            param.Add("@QueryString", entity.QueryString);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Menu_SaveLinkDetails", param).ToString();
        }
        public DataTable GetGroupsList(Int16 RegionID, Int32 UserTypeID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@UserTypeID", UserTypeID);

            return _dbAccess.GetDataTable("Menu_GetGroupsList", param);
        }
        public DataTable GetMenusList(Int16 RegionID, Int32 UserTypeID, Int32 ParentMenuID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@ParentMenuID", ParentMenuID);

            return _dbAccess.GetDataTable("Menu_GetMenusList", param);
        }
        public DataTable GetAvailableMenusList(Int16 RegionID, Int32 UserTypeID, Int32 ParentMenuID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@RegionID", RegionID);
            param.Add("@UserTypeID", UserTypeID);
            param.Add("@ParentMenuID", ParentMenuID);

            return _dbAccess.GetDataTable("Menu_GetAvailableMenusList", param);
        }
        public string SaveMenusActiveStatus(List<MenuEntity> ListEntity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@MenusXML", GetXML(ListEntity));

            return _dbAccess.ExecuteScalar("Menu_SaveMenusActiveStatus", param).ToString();
        }
        public DataTable GetMenuDetails(Int32 MenuID)
        {
            var param = new Dictionary<string, object>();

            param.Add("@MenuID", MenuID);

            return _dbAccess.GetDataTable("Menu_GetMenuDetails", param);
        }
        public string SaveMenuDetails(MenuEntity entity)
        {
            var param = new Dictionary<string, object>();

            param.Add("@MenuID", entity.MenuID);
            param.Add("@UserTypeID", entity.UserTypeID);
            param.Add("@ParentMenuID", entity.ParentMenuID);
            param.Add("@LinkID", entity.LinkID);
            param.Add("@DisplayStartDateTime", entity.DisplayStartDateTime);
            param.Add("@DisplayEndDateTime", entity.DisplayEndDateTime);
            param.Add("@Target", entity.Target);
            param.Add("@IsNew", entity.IsNew);
            param.Add("@IsActive", entity.IsActive);
            param.Add("@RegionID", entity.RegionID);
            param.Add("@UserLoginID", entity.UserLoginID);
            param.Add("@IPAddress", entity.IPAddress);

            return _dbAccess.ExecuteScalar("Menu_SaveMenuDetails", param).ToString();
        }
    }
}
