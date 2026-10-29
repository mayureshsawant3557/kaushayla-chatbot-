using System;
using System.Data;
using Portal.Entities.Administration;

namespace Portal.Business.Interface.Administration
{
    public interface IManageUsers
    {
        DataTable GetUsersList(Int32 UserTypeID);
        string ActivateOrDeactivateUser(Int64 UserID, string ModifiedBy, string ModifiedByIPAddress);
        string SaveUser(UserEntity entity);
        UserEntity GetUserDetails(Int64 UserID);
        string EditUser(UserEntity entity);
        DataTable SearchUserById(string searchTerm);
    }
}