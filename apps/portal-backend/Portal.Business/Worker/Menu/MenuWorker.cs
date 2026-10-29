using Portal.Business.Interface.Menu;
using Portal.Business.Worker.Utility;
using Portal.Data;
using Portal.Entities.Menu;
using System.Data;


namespace Portal.Business.Worker.Menu
{
    public class MenuWorker : IMenu
    {
        private readonly Repository _objData;

        // ✅ Dependency Injection to avoid NullReferenceException
        public MenuWorker(Repository objData)
        {
            _objData = objData ?? throw new ArgumentNullException(nameof(objData), "Repository instance cannot be null");
        }


        public DataTable GetMenu(short RegionID, int UserTypeID, string UserLoginID, string Language = "")
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetMenu(RegionID, UserTypeID, UserLoginID, Language);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMenu", UserLoginID);
                throw ex;
            }
            return dt;
        }
        public DataTable GetLinksList(string Directory)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetLinksList(Directory);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLinksList");
                throw ex;
            }
            return dt;
        }
        public string SaveLinksActiveStatus(List<LinkEntity> ListEntity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveLinksActiveStatus(ListEntity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveLinksActiveStatus");
                retVal = ex.Message;
            }
            return retVal;
        }
        public LinkEntity GetLinkDetails(int LinkID)
        {
            LinkEntity obj = new LinkEntity();
            try
            {
                DataTable dt = _objData.GetLinkDetails(LinkID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.LinkID = Convert.ToInt32(dr["LinkID"]);
                    obj.LinkName = Convert.ToString(dr["LinkName"]);
                    obj.LinkNameMarathi = Convert.ToString(dr["LinkNameMarathi"]);
                    obj.LinkDescription = Convert.ToString(dr["LinkDescription"]);
                    obj.LinkDescriptionMarathi = Convert.ToString(dr["LinkDescriptionMarathi"]);
                    obj.LinkURL = Convert.ToString(dr["LinkURL"]);
                    obj.LinkType = Convert.ToString(dr["LinkType"]);
                    obj.Directory = Convert.ToString(dr["Directory"]);
                    obj.PageName = Convert.ToString(dr["PageName"]);
                    obj.QueryString = Convert.ToString(dr["QueryString"]);
                    obj.IsActive = Convert.ToInt16(dr["IsActive"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLinkDetails");
                throw ex;
            }
            return obj;
        }
        public string SaveLinkDetails(LinkEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveLinkDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveLinkDetails");
                retVal = ex.Message;
            }
            return retVal;
        }
        public DataTable GetGroupsList(short RegionID, int UserTypeID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetGroupsList(RegionID, UserTypeID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetGroupsList");
                throw ex;
            }
            return dt;
        }
        public DataTable GetMenusList(short RegionID, int UserTypeID, int ParentMenuID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetMenusList(RegionID, UserTypeID, ParentMenuID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetMenusList");
                throw ex;
            }
            return dt;
        }
        public DataTable GetAvailableMenusList(short RegionID, int UserTypeID, int ParentMenuID)
        {
            DataTable dt = new DataTable();
            try
            {
                dt = _objData.GetAvailableMenusList(RegionID, UserTypeID, ParentMenuID);
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetAvailableMenusList");
                throw ex;
            }
            return dt;
        }
        public string SaveMenusActiveStatus(List<MenuEntity> ListEntity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveMenusActiveStatus(ListEntity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveMenusActiveStatus");
                retVal = ex.Message;
            }
            return retVal;
        }
        public MenuEntity GetMenuDetails(int MenuID)
        {
            MenuEntity obj = new MenuEntity();
            try
            {
                DataTable dt = _objData.GetMenuDetails(MenuID);

                if (dt != null && dt.Rows.Count > 0)
                {
                    DataRow dr = dt.Rows[0];

                    obj.MenuID = Convert.ToInt32(dr["MenuID"]);
                    obj.UserTypeID = Convert.ToInt32(dr["UserTypeID"]);
                    obj.ParentMenuID = Convert.ToInt32(dr["ParentMenuID"]);
                    obj.LinkID = Convert.ToInt32(dr["LinkID"]);
                    obj.DisplayStartDateTime = Convert.ToDateTime(dr["DisplayStartDateTime"]);
                    obj.DisplayEndDateTime = Convert.ToDateTime(dr["DisplayEndDateTime"]);
                    obj.CSSClass = Convert.ToString(dr["CSSClass"]);
                    obj.GroupName = Convert.ToString(dr["GroupName"]);
                    obj.Target = Convert.ToString(dr["Target"]);
                    obj.IsNew = Convert.ToInt16(dr["IsNew"]);
                    obj.IsActive = Convert.ToInt16(dr["IsActive"]);
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "GetLinkDetails");
                throw ex;
            }
            return obj;
        }
        public string SaveMenuDetails(MenuEntity entity)
        {
            string retVal = "";
            try
            {
                retVal = _objData.SaveMenuDetails(entity);
                if (retVal.ToUpper() == "N")
                {
                    retVal = "Data has not been saved. Please try again.";
                }
            }
            catch (Exception ex)
            {
                CommonHelper.SaveException(ex.Message, "SaveMenuDetails");
                retVal = ex.Message;
            }
            return retVal;
        }
    }
}
