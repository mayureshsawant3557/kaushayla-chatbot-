import React, { useState, useEffect, useMemo, useContext } from "react";
import { Menu, Search, X } from "lucide-react";
import agent from "../../../lib/api/agent";
import { SwalHelper } from "../../../utils/swalHelper";
import DropdownComponent from "../../../Component/formcomponent/DropdownComponent";
import FormComponent from "../../../Component/formcomponent/FormComponent";
import FilteredTableComponent from "../../../Component/formcomponent/FilteredTableComponent";
import { ThemeContext } from "../../../Component/Context/ThemeContext";
import { getDeviceIP } from "../../../utils/CommonHelper";
import {
  GetUserTypes,
  GetUsersList,
  SaveUser,
  ActivateOrDeactivateUser,
  GetEMailSMS,
} from "../../../Endpoints_All/Administration/admin";

const ManageUsers = () => {
  const { color } = useContext(ThemeContext);
  const [userIP, setUserIP] = useState("");
  const [userType, setUserType] = useState("");
  const [userTypeOptions, setUserTypeOptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStaffUserType, setIsStaffUserType] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginatedUsers, setPaginatedUsers] = useState([]);

  const [formData, setFormData] = useState({
    userName: "",
    mobile: "",
    email: "",
    district: "",
    headOfInstitute: false,
    trainer: false,
    assessor: false,
    subjectExpert: false,
    officeStaff: false,
    promoter: false,
    management: false,
    sectorialExpertise: false,
  });

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);

  useEffect(() => {
    const fetchIP = async () => {
      const ip = await getDeviceIP();
      setUserIP(ip);
    };
    fetchIP();
  }, []);

  useEffect(() => {
    fetchUserTypes();
  }, []);

  useEffect(() => {
    if (userType) {
      fetchUsers(userType);
      const selectedType = userTypeOptions.find(
        (opt) => (opt.Value || opt.value) === userType,
      );
      setIsStaffUserType(selectedType?.Text === "Staff" || userType === "95");
    }
  }, [userType]);

  // Update filtered data whenever users change (not on search term change)
  useEffect(() => {
    if (!isSearching) {
      setFilteredUsers(users);
    }
  }, [users, isSearching]);

  // Update paginated data whenever filteredUsers or pagination settings change
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedUsers(filteredUsers.slice(startIndex, endIndex));
  }, [filteredUsers, currentPage, itemsPerPage]);

  const fetchUserTypes = async () => {
    try {
      startLoading();
      const response = await agent.get(GetUserTypes, {
        params: {
          TableName: "Master_UserType",
          DataValueField: "UserTypeID",
          DataTextField: "UserType",
          HasSelect: true,
          orderByText: "UserTypeID",
        },
      });

      let userTypesData = response.data?.Data || [];

      const filteredTypes = userTypesData.filter((type) => {
        const value = type.Value?.toString();
        return (
          value !== "-1" &&
          value !== "0" &&
          value !== "11" &&
          value !== "12" &&
          value !== "13" &&
          value !== "91"
        );
      });

      setUserTypeOptions(filteredTypes);
    } catch (error) {
      SwalHelper.error("Failed to load user types");
    } finally {
      stopLoading();
    }
  };

  const fetchUsers = async (userTypeID) => {
    try {
      startLoading();
      const response = await agent.get(GetUsersList, {
        params: { userTypeID },
      });

      let usersData = response.data?.Data || response.data || [];

      if (!Array.isArray(usersData)) {
        usersData = [];
      }

      const decryptedUsers = usersData.map((user) => ({
        ...user,
        UserPassword: user.UserPassword
          ? (() => {
              try {
                return atob(user.UserPassword);
              } catch (e) {
                return user.UserPassword;
              }
            })()
          : user.UserPassword,
      }));

      setUsers(decryptedUsers);
      setFilteredUsers(decryptedUsers);
      setSearchTerm("");
      setIsSearching(false);
      setCurrentPage(1);
    } catch (error) {
      SwalHelper.error("Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      stopLoading();
    }
  };

  // Search users via API
  const searchUsers = async () => {
    if (!searchTerm.trim()) {
      SwalHelper.warning("Please enter search criteria");
      return;
    }

    if (!userType) {
      SwalHelper.warning("Please select a user type first");
      return;
    }

    try {
      startLoading();
      setIsSearching(true);

      const response = await agent.get("/api/UserManagement/SearchUserById", {
        params: {
          searchTerm: searchTerm.trim(),
        },
      });

      // Handle multiple response formats
      let usersData = [];

      if (Array.isArray(response?.data?.data)) {
        usersData = response.data.data;
      } else if (Array.isArray(response?.data?.Data)) {
        usersData = response.data.Data;
      } else if (Array.isArray(response?.data)) {
        usersData = response.data;
      } else if (response?.data?.data) {
        usersData = [response.data.data];
      } else if (response?.data?.Data) {
        usersData = [response.data.Data];
      } else if (response?.data) {
        usersData = [response.data];
      }

      const decryptedUsers = usersData.map((user) => ({
        ...user,
        UserPassword: user.UserPassword
          ? (() => {
              try {
                return atob(user.UserPassword);
              } catch {
                return user.UserPassword;
              }
            })()
          : "",
      }));

      if (decryptedUsers.length > 0) {
        setFilteredUsers(decryptedUsers);
        setCurrentPage(1);

        SwalHelper.success(
          `Found ${decryptedUsers.length} user(s) matching "${searchTerm}"`,
        );
      } else {
        setFilteredUsers([]);
        SwalHelper.warning(`No users found matching "${searchTerm}"`);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.title ||
          "Invalid search parameters. Please check your search criteria.";

        SwalHelper.error(`Search failed: ${errorMessage}`);
      } else {
        SwalHelper.error("Failed to search users");
      }

      setFilteredUsers([]);
    } finally {
      stopLoading();
    }
  };

  const handleSearchClick = () => {
    if (userType) {
      searchUsers();
    } else {
      SwalHelper.warning("Please select a user type first");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setFilteredUsers(users);
    setIsSearching(false);
    setCurrentPage(1);
    SwalHelper.info("Search cleared. Showing all users.");
  };

  const toggleFormView = () => {
    setFormError("");
    if (isFormVisible) {
      setIsFormVisible(false);
    } else {
      setFormData({
        userName: "",
        mobile: "",
        email: "",
        district: "",
        headOfInstitute: false,
        trainer: false,
        assessor: false,
        subjectExpert: false,
        officeStaff: false,
        promoter: false,
        management: false,
        sectorialExpertise: false,
      });
      setIsEditing(false);
      setCurrentUserId(null);
      setIsFormVisible(true);
    }
  };

  const handleChange = (name, value) => {
    setFormError("");
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name, checked) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const saveUser = async () => {
    if (!formData.userName || !formData.mobile) {
      setFormError("User Name and Mobile Number are required fields.");
      return;
    }

    try {
      startLoading();

      const currentUserID = localStorage.getItem("UserId") || 0;

      const payload = {
        UserType: parseInt(userType),
        UserLoginID: "",
        UserPassword: "",
        IsActive: true,
        ActivOrDeactive: true,
        ModifiedBy: parseInt(currentUserID),
        ModifiedByIPAddress: userIP,
        UserEMailID: formData.email || "",
        UserTypeID: parseInt(userType),
        UserName: formData.userName.toUpperCase(),
        UserMobileNo: formData.mobile,
        UserEmail: formData.email,
        District: formData.district,
        UserID: isEditing ? currentUserId : 0,
        HeadofInstitute: formData.headOfInstitute,
        Trainer: formData.trainer,
        Assessor: formData.assessor,
        SubjectExpert: formData.subjectExpert,
        OfficeStaff: formData.officeStaff,
        Promoter: formData.promoter,
        Managment: formData.management,
        SectorialExpertise: formData.sectorialExpertise,
      };

      const response = await agent.post(SaveUser, payload);

      if (
        response.data === "Y" ||
        response.data?.Status === "Success" ||
        response.data?.message === "Y"
      ) {
        SwalHelper.success(
          `User ${isEditing ? "updated" : "added"} successfully`,
        );
        setIsFormVisible(false);
        fetchUsers(userType);
      } else {
        SwalHelper.error(
          response.data?.Message ||
            response.data?.message ||
            response.data ||
            "Failed to save user",
        );
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Validation errors:\n";
        Object.keys(errors).forEach((key) => {
          errorMessage += `${key}: ${errors[key].join(", ")}\n`;
        });
        SwalHelper.error(errorMessage);
      } else {
        SwalHelper.error("Failed to save user");
      }
    } finally {
      stopLoading();
    }
  };

  const sendSMS = async (user) => {
    try {
      startLoading();
      const response = await agent.get(GetEMailSMS, {
        params: {
          Action: "SendLoginIDPassword",
          Type: "S",
          ReferenceID: user.UserLoginID,
        },
      });

      const smsData = response.data?.Data || response.data;

      if (smsData && smsData.length > 0) {
        const data = smsData[0];
        const message = data.Message?.replace(
          "##Password##",
          user.UserPassword || "",
        );

        SwalHelper.success(
          "Login ID and Password has been sent to Registered Mobile Number.",
        );
      } else {
        SwalHelper.warning("SMS template not configured for this user type.");
      }
    } catch (error) {
      SwalHelper.error("Failed to send SMS");
    } finally {
      stopLoading();
    }
  };

  const editUser = (user) => {
    setFormError("");
    setFormData({
      userName: user.UserName || "",
      mobile: user.UserMobileNo || "",
      email: user.UserEmail || "",
      district: user.District || "",
      headOfInstitute:
        user.HeadofInstitute === true || user.HeadofInstitute === "true",
      trainer: user.Trainer === true || user.Trainer === "true",
      assessor: user.Assessor === true || user.Assessor === "true",
      subjectExpert:
        user.SubjectExpert === true || user.SubjectExpert === "true",
      officeStaff: user.OfficeStaff === true || user.OfficeStaff === "true",
      promoter: user.Promoter === true || user.Promoter === "true",
      management: user.Managment === true || user.Managment === "true",
      sectorialExpertise:
        user.SectorialExpertise === true || user.SectorialExpertise === "true",
    });
    setIsEditing(true);
    setCurrentUserId(user.UserID);
    setIsFormVisible(true);
  };

  const toggleUserStatus = async (user) => {
    try {
      startLoading();

      const isCurrentlyActive =
        user.IsActive === "Active" ||
        user.IsActive === true ||
        user.IsActive === 1 ||
        user.IsActive === "true" ||
        user.IsActive === "1";

      const currentUserID = localStorage.getItem("UserId") || 0;

      const payload = {
        UserID: user.UserID,
        IsActive: !isCurrentlyActive,
        ModifiedBy: parseInt(currentUserID),
        ModifiedByIPAddress: userIP,
      };

      const response = await agent.post(ActivateOrDeactivateUser, payload);

      if (
        response.data?.message === "Y" ||
        response.data === "Y" ||
        response.data?.Status === "Success"
      ) {
        SwalHelper.success(
          `User ${isCurrentlyActive ? "Deactivated" : "Activated"} Successfully`,
        );
        fetchUsers(userType);
      } else {
        SwalHelper.error(
          response.data?.Message ||
            response.data ||
            "Failed to update user status",
        );
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        let errorMessage = "Validation errors:\n";
        Object.keys(errors).forEach((key) => {
          errorMessage += `${key}: ${errors[key].join(", ")}\n`;
        });
        SwalHelper.error(errorMessage);
      } else if (error.response?.data?.title) {
        SwalHelper.error(
          `${error.response.data.title}: ${error.response.data.detail || ""}`,
        );
      } else if (error.message) {
        SwalHelper.error(error.message);
      } else {
        SwalHelper.error("Failed to update user status");
      }
    } finally {
      stopLoading();
    }
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (itemsPerPage) => {
    setItemsPerPage(itemsPerPage);
    setCurrentPage(1);
  };

  // Calculate pagination info
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startEntry = (currentPage - 1) * itemsPerPage + 1;
  const endEntry = Math.min(currentPage * itemsPerPage, filteredUsers.length);

  // Custom render function for the table
  const renderUserTableCell = (row, column, rowIndex) => {
    const isActive =
      row.IsActive === "Active" ||
      row.IsActive === true ||
      row.IsActive === 1 ||
      row.IsActive === "true" ||
      row.IsActive === "1";

    if (column.key === "sendSMS") {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => sendSMS(row)}
            disabled={!isActive}
            className={`px-2 py-1 text-white text-xs font-medium rounded shadow-sm whitespace-nowrap ${
              isActive
                ? "bg-[#f0ad4e] hover:bg-[#ec971f]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            SMS
          </button>
        </div>
      );
    }

    if (column.key === "edit") {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => editUser(row)}
            disabled={!isActive}
            className={`px-2 py-1 text-white text-xs font-medium rounded shadow-sm ${
              isActive
                ? "bg-[#337ab7] hover:bg-[#286090]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Edit
          </button>
        </div>
      );
    }

    if (column.key === "activateDeactivate") {
      return (
        <div className="flex justify-center">
          <button
            onClick={() => toggleUserStatus(row)}
            className={`px-2 py-1 text-white text-xs font-medium rounded shadow-sm transition-colors whitespace-nowrap ${
              isActive
                ? "bg-[#d9534f] hover:bg-[#c9302c]"
                : "bg-[#1e7e34] hover:bg-[#19692c]"
            }`}
          >
            {isActive ? "Deactive" : "Active"}
          </button>
        </div>
      );
    }

    if (column.key === "IsActive") {
      return (
        <span
          className={
            isActive ? "text-green-600 font-medium" : "text-red-500 font-medium"
          }
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    }

    if (column.key === "UserPassword") {
      return row.UserPassword || "";
    }

    if (column.key === "HeadofInstitute") {
      return row.HeadofInstitute === "true" || row.HeadofInstitute === true
        ? "✓"
        : "✗";
    }

    if (column.key === "Trainer") {
      return row.Trainer === "true" || row.Trainer === true ? "✓" : "✗";
    }

    if (column.key === "Assessor") {
      return row.Assessor === "true" || row.Assessor === true ? "✓" : "✗";
    }

    if (column.key === "SubjectExpert") {
      return row.SubjectExpert === "true" || row.SubjectExpert === true
        ? "✓"
        : "✗";
    }

    if (column.key === "OfficeStaff") {
      return row.OfficeStaff === "true" || row.OfficeStaff === true ? "✓" : "✗";
    }

    if (column.key === "Promoter") {
      return row.Promoter === "true" || row.Promoter === true ? "✓" : "✗";
    }

    if (column.key === "Managment") {
      return row.Managment === "true" || row.Managment === true ? "✓" : "✗";
    }

    if (column.key === "SectorialExpertise") {
      return row.SectorialExpertise === "true" ||
        row.SectorialExpertise === true
        ? "✓"
        : "✗";
    }

    return row[column.key] || "";
  };

  // Table columns configuration
  const getUserTableColumns = () => {
    // Themed header styling — uses the current ThemeContext color instead of a
    // hardcoded gray background, with white text for contrast.
    const headerThemeClass = `text-center ${color || "bg-gray-100"} text-white`;

    const baseColumns = [
      {
        key: "sendSMS",
        header: "SMS",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: false,
        width: "60px",
      },
      {
        key: "edit",
        header: "Edit",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: false,
        width: "60px",
      },
      {
        key: "activateDeactivate",
        header: "Act/Deact",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: false,
        width: "80px",
      },
      {
        key: "UserLoginID",
        header: "Login ID",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: true,
        width: "100px",
      },
      {
        key: "UserPassword",
        header: "Pwd",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: true,
        width: "70px",
      },
      {
        key: "UserName",
        header: "Name",
        headerClassName: headerThemeClass,
        className: "text-left",
        sortable: true,
        width: "150px",
      },
      {
        key: "UserMobileNo",
        header: "Mobile",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: true,
        width: "100px",
      },
      {
        key: "IsActive",
        header: "Status",
        headerClassName: headerThemeClass,
        className: "text-center",
        sortable: true,
        width: "80px",
      },
    ];

    if (isStaffUserType) {
      const staffColumns = [];
      return [...baseColumns, ...staffColumns];
    }

    return baseColumns;
  };

  return (
    <div className="container mx-auto p-6 max-w-full bg-gray-50 min-h-screen">
      <fieldset className="border border-gray-300 rounded mb-6 px-4 pt-3 pb-1">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-xl font-bold text-white shadow-md`}
        >
          <Menu size={22} className="stroke-[2.5]" />
          <span>Manage Users</span>
        </legend>

        <div className="space-y-6">
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-700">Loading...</p>
              </div>
            </div>
          )}

          {!isFormVisible ? (
            <>
              {/* Filter Section */}
              <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 mt-4">
                  <div className="w-full md:w-[320px]">
                    <DropdownComponent
                      label="User Type"
                      options={userTypeOptions.map((opt) => ({
                        value: opt.Value,
                        label: opt.Text,
                      }))}
                      value={userType}
                      onChange={setUserType}
                      required={true}
                      isForFilterTable={false}
                    />
                  </div>
                  <button
                    onClick={toggleFormView}
                    disabled={!userType}
                    className={`w-full md:w-auto px-8 py-2 rounded-md text-base font-semibold shadow-sm whitespace-nowrap transition-colors ${
                      !userType
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#1e7e34] hover:bg-[#19692c] text-white"
                    }`}
                  >
                    Add New User
                  </button>
                </div>
              </fieldset>

              {/* Search Section */}
              {userType && (
                <div className="flex justify-center mt-4 mb-2">
                  <div className="flex gap-2 w-full max-w-md">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSearchClick()
                        }
                        placeholder="Search by Login ID, Name, Mobile or Email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {searchTerm && (
                        <button
                          onClick={handleClearSearch}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleSearchClick}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 whitespace-nowrap"
                    >
                      <Search size={18} />
                      Search
                    </button>
                  </div>
                </div>
              )}

              {/* Users List Section */}
              {userType && (
                <fieldset className="border border-gray-300 rounded p-4 bg-gray-50">
                  <legend className="text-base font-semibold text-gray-800 px-2">
                    Users List
                    {isSearching && searchTerm && (
                      <span className="ml-2 text-sm font-normal text-blue-600">
                        (Search results for "{searchTerm}":{" "}
                        {filteredUsers.length} users found)
                      </span>
                    )}
                    {!isSearching && users.length > 0 && (
                      <span className="ml-2 text-sm font-normal text-gray-500">
                        (Total: {users.length} users)
                      </span>
                    )}
                  </legend>

                  <div className="mt-3 overflow-x-auto">
                    <FilteredTableComponent
                      data={paginatedUsers}
                      columns={getUserTableColumns()}
                      loading={loading}
                      searchable={true}
                      sortable={true}
                      exportable={true}
                      title=""
                      exportFileName={`${userTypeOptions.find((opt) => opt.Value === userType)?.Text || "users"}_users${isSearching ? `_search_${searchTerm}` : ""}`}
                      emptyStateMessage="No records found."
                      emptyStateSubMessage={
                        isSearching
                          ? `No users match "${searchTerm}"`
                          : "Please select a user type or add new users"
                      }
                      showExcel={true}
                      showPDF={true}
                      showSearch={true}
                      searchPosition="right"
                      filterColumns={[]}
                      maxHeight="500px"
                      renderCell={renderUserTableCell}
                    />

                    {/* Custom Pagination Info */}
                    {filteredUsers.length > 0 && (
                      <div className="flex justify-between items-center mt-4 px-2">
                        <div className="flex gap-2"></div>
                        <div className="flex gap-2 items-center"></div>
                      </div>
                    )}
                  </div>
                </fieldset>
              )}
            </>
          ) : (
            /* Add/Edit User Form */
            <fieldset className="border border-gray-300 rounded-lg p-6 bg-white shadow-lg">
              <legend
                className={`flex items-center gap-2 rounded-md border border-gray-300 ${color} px-4 py-2 text-sm font-bold text-white shadow-md`}
              >
                {isEditing ? "Edit User" : "Add New User"}
              </legend>

              {formError && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 text-sm font-medium rounded border border-red-200 w-full">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
                <FormComponent
                  label="User Name"
                  type="text"
                  value={formData.userName}
                  onChange={(val) => handleChange("userName", val)}
                  required={true}
                  error={
                    formError && !formData.userName
                      ? "User Name is required"
                      : ""
                  }
                  autoUpperCase={true}
                  placeholder="ENTER USER NAME"
                />

                <FormComponent
                  label="User Mobile Number"
                  type="text"
                  value={formData.mobile}
                  onChange={(val) =>
                    handleChange("mobile", val.replace(/\D/g, ""))
                  }
                  required={true}
                  error={
                    formError && !formData.mobile
                      ? "Mobile Number is required"
                      : ""
                  }
                  placeholder="ENTER MOBILE NUMBER"
                />

                <FormComponent
                  label="User E-Mail ID"
                  type="email"
                  value={formData.email}
                  onChange={(val) => handleChange("email", val)}
                  placeholder="ENTER EMAIL ID"
                />

                <FormComponent
                  label="District"
                  type="text"
                  value={formData.district}
                  onChange={(val) => handleChange("district", val)}
                  placeholder="ENTER DISTRICT"
                />
              </div>

              {/* Staff-specific role checkboxes */}
              {isStaffUserType && (
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h3 className="text-md font-semibold text-gray-800 mb-4">
                    User Roles
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.headOfInstitute}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "headOfInstitute",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Head of Institute
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.trainer}
                        onChange={(e) =>
                          handleCheckboxChange("trainer", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Trainer</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.assessor}
                        onChange={(e) =>
                          handleCheckboxChange("assessor", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Assessor</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.subjectExpert}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "subjectExpert",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Subject Expert
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.officeStaff}
                        onChange={(e) =>
                          handleCheckboxChange("officeStaff", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Office Staff
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.promoter}
                        onChange={(e) =>
                          handleCheckboxChange("promoter", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Promoter</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.management}
                        onChange={(e) =>
                          handleCheckboxChange("management", e.target.checked)
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Management</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.sectorialExpertise}
                        onChange={(e) =>
                          handleCheckboxChange(
                            "sectorialExpertise",
                            e.target.checked,
                          )
                        }
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">
                        Sectorial Expertise
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex justify-center gap-4 mt-8 pt-6 border-t-2 border-blue-300">
                <button
                  type="button"
                  onClick={saveUser}
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-6 py-2 rounded font-semibold text-sm transition-colors"
                  disabled={loading}
                >
                  {loading
                    ? "Saving..."
                    : isEditing
                      ? "Update User"
                      : "Add User"}
                </button>
                <button
                  type="button"
                  onClick={toggleFormView}
                  className="px-8 py-2 bg-red-600 text-white font-semibold rounded text-sm hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </fieldset>
          )}
        </div>
      </fieldset>
    </div>
  );
};

export default ManageUsers;
