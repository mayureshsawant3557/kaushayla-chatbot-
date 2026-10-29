using System;
using System.Collections.Generic;
using System.Data;
using Portal.Entities.Administration;

namespace Portal.Data
{
    public partial class Repository
    {
        public DataTable GetUsersList(Int32 UserTypeID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserTypeID", UserTypeID);
            return _dbAccess.GetDataTable("Administration_GetUsersList", param);
        }

        // In your DataAccess class
        public DataTable SearchUserById(string searchTerm)
        {
            var param = new Dictionary<string, object>();
            param.Add("@SearchTerm", searchTerm);
            
            return _dbAccess.GetDataTable("User_SearchById", param);
        }

        public string ActivateOrDeactivateUser(Int64 UserID, string ModifiedBy, string ModifiedByIPAddress)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", UserID);
            param.Add("@ModifiedBy", ModifiedBy);
            param.Add("@ModifiedByIPAddress", ModifiedByIPAddress);
            return _dbAccess.ExecuteScalar("Administration_ActivateOrDeactivateUser", param).ToString();
        }

        public string SaveUser(UserEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", entity.UserID);
            param.Add("@UserTypeID", entity.UserTypeID);
            param.Add("@UserPassword", entity.UserPassword);
            param.Add("@UserName", entity.UserName);
            param.Add("@UserMobileNo", entity.UserMobileNo);
            param.Add("@UserEMailID", entity.UserEMailID);
            param.Add("@DistrictID", entity.DistrictID);
            param.Add("@RegionID", entity.RegionID);
            param.Add("@ModifiedBy", entity.ModifiedBy);
            param.Add("@ModifiedByIPAddress", entity.ModifiedByIPAddress);
            return _dbAccess.ExecuteScalar("Administration_SaveUser", param).ToString();
        }

        public DataTable GetUserDetails(Int64 UserID)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", UserID);
            return _dbAccess.GetDataTable("Administration_GetUserDetails", param);
        }

        public string EditUser(UserEntity entity)
        {
            var param = new Dictionary<string, object>();
            param.Add("@UserID", entity.UserID);
            param.Add("@UserTypeID", entity.UserTypeID);
            param.Add("@UserName", entity.UserName);
            param.Add("@UserMobileNo", entity.UserMobileNo);
            param.Add("@UserEMailID", entity.UserEMailID);
            param.Add("@ModifiedBy", entity.ModifiedBy);
            param.Add("@ModifiedByIPAddress", entity.ModifiedByIPAddress);
            return _dbAccess.ExecuteScalar("Administration_EditUser", param).ToString();
        }
    }
}