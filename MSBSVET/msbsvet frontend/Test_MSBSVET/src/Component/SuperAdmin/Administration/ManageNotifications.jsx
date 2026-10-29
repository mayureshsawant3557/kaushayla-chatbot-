import { useState, useEffect, useContext } from "react";
import UploadPdf from "../../formcomponent/UploadPdf";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FilteredTableComponent from "../../formcomponent/FilteredTableComponent";
import { GetMasterTableList } from "../../../Endpoints_All/Base/masterData";
import {
  GetNotificationList,
  SaveNotification,
  DeleteNotification,
} from "../../../Endpoints_All/Administration/admin";
import agent from "../../../lib/api/agent";
import { getDeviceIP } from "../../../utils/CommonHelper";
import { useAuth } from "../../../Hooks/AuthContext";
import { ThemeContext } from "../../../Component/Context/ThemeContext";

const ManageNotifications = () => {
  const { color } = useContext(ThemeContext);

  // Form state
  const [category, setCategory] = useState("");
  const [titleEnglish, setTitleEnglish] = useState("");
  const [titleMarathi, setTitleMarathi] = useState("");
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");
  const [publishDateTime, setPublishDateTime] = useState("");
  const [displayNewImage, setDisplayNewImage] = useState("");
  const [isActive, setIsActive] = useState("");
  const [contentType, setContentType] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [textContentMarathi, setTextContentMarathi] = useState("");
  const [ipAddress, setIpAddress] = useState("");

  // Data state
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedNotificationCategory, setSelectedNotificationCategory] =
    useState("-1");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [editingNotification, setEditingNotification] = useState(null);
  const [loading, setLoading] = useState({
    categories: false,
    notifications: false,
  });

  // User & region info
  const { userInfo } = useAuth();
  const userLoginID = userInfo?.UserLoginID || "admin";
  const regionID = userInfo?.RegionID || 1;

  // Format options for dropdown
  const formatOptions = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      value: item.Value,
      label: item.Text,
    }));
  };

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  const contentTypeOptions = [
    { value: "File", label: "File" },
    { value: "Text", label: "Text" },
    { value: "Hyperlink", label: "Hyperlink" },
  ];

  useEffect(() => {
    fetchCategories();
    fetchIP();
    fetchNotifications(-1);
  }, []);

  const fetchIP = async () => {
    try {
      const ip = await getDeviceIP();
      setIpAddress(ip);
    } catch (err) {
      console.error("Failed to get IP:", err);
    }
  };

  const fetchCategories = async () => {
    setLoading((prev) => ({ ...prev, categories: true }));
    try {
      const response = await agent.get(GetMasterTableList, {
        params: {
          TableName: "Master_NotificationCategory",
          DataValueField: "NotificationCategoryid",
          DataTextField: "NotificationCategory",
          HasSelect: true,
        },
      });

      if (response.data.Status === "Success") {
        setCategories(formatOptions(response.data.Data));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading((prev) => ({ ...prev, categories: false }));
    }
  };

  const fetchNotifications = async (categoryId = -1) => {
    setLoading((prev) => ({ ...prev, notifications: true }));
    try {
      const params = {
        RegionID: regionID,
        NotificationCategoryID: categoryId,
      };
      const response = await agent.get(GetNotificationList, { params });

      if (response.data.Status === "Success") {
        setNotifications(response.data.Data);
        setFilteredNotifications(response.data.Data);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading((prev) => ({ ...prev, notifications: false }));
    }
  };

  const handleCategoryFilter = (value) => {
    setSelectedNotificationCategory(value);
    const categoryIdForAPI = value === "-1" ? -1 : parseInt(value, 10);
    fetchNotifications(categoryIdForAPI);
  };

  const handleDropdownChange = (name, value) => {
    switch (name) {
      case "category":
        setCategory(value);
        break;
      case "displayNewImage":
        setDisplayNewImage(value);
        break;
      case "isActive":
        setIsActive(value);
        break;
      case "contentType":
        setContentType(value);
        break;
      case "filterCategory":
        handleCategoryFilter(value);
        break;
      default:
        break;
    }
  };

  const handleFileChange = (uploadResult) => {
    if (uploadResult) {
      setUploadFile({
        filePath: uploadResult.filePath,
        fileName: uploadResult.fileName,
        uniqueFileName: uploadResult.uniqueFileName,
        file: uploadResult.file,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!category || category === "-1")
      newErrors.category = "Category is required";
    if (!titleEnglish) newErrors.titleEnglish = "Title (English) is required";
    if (!titleMarathi) newErrors.titleMarathi = "Title (Marathi) is required";
    if (!startDateTime)
      newErrors.startDateTime = "Start Date & Time is required";
    if (!endDateTime) newErrors.endDateTime = "End Date & Time is required";
    if (!publishDateTime)
      newErrors.publishDateTime = "Publish Date & Time is required";
    if (!displayNewImage)
      newErrors.displayNewImage = "Display New Image is required";
    if (!isActive) newErrors.isActive = "Is Active is required";
    if (!contentType) newErrors.contentType = "Content Type is required";

    if (contentType === "File" && !uploadFile && !editingNotification) {
      newErrors.uploadFile = "File is required when Content Type is File";
    }

    if (contentType === "Text" && !textContent) {
      newErrors.textContent =
        "Text Content is required when Content Type is Text";
    }

    if (contentType === "Hyperlink" && !textContent) {
      newErrors.textContent = "URL is required when Content Type is Hyperlink";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);

      try {
        // Determine ContentType code based on selection
        let contentTypeCode = "T";
        if (contentType === "File") contentTypeCode = "D";
        else if (contentType === "Hyperlink") contentTypeCode = "H";

        const requestData = {
          NotificationID: editingNotification
            ? editingNotification.NotificationID
            : 0,
          NotificationCategoryID: parseInt(category, 10),
          NotificationCategory:
            categories.find((cat) => cat.value === category)?.label || "",
          NotificationTitle: titleEnglish,
          NotificationTitleMarathi: titleMarathi,
          DisplayStartDateTime: startDateTime,
          DisplayEndDateTime: endDateTime,
          PublishDateTime: publishDateTime,
          DisplayStartDateTimeF: startDateTime,
          DisplayEndDateTimeF: endDateTime,
          PublishDateTimeF: publishDateTime,
          ContentType: contentTypeCode,
          TextContent: textContent,
          TextContentMarathi: textContentMarathi,
          FileContent: "",
          FileContentName: "",
          FileContentURL: "",
          OpenInNewPage: 1,
          DisplayNewImage: displayNewImage === "Yes" ? 1 : 0,
          IsActive: isActive === "Yes" ? 1 : 0,
          RegionID: regionID,
          UserLoginID: userLoginID,
          IPAddress: ipAddress,
        };

        // Handle different content types
        if (contentType === "File") {
          if (uploadFile && uploadFile.filePath) {
            // New file uploaded
            requestData.FileContentName = uploadFile.fileName;
            requestData.FileContentURL = uploadFile.filePath;
            requestData.FileContent =
              uploadFile.file?.type || "application/octet-stream";
          } else if (
            editingNotification &&
            editingNotification.FileContentURL
          ) {
            // Keep existing file
            requestData.FileContentName =
              editingNotification.FileContentName || "";
            requestData.FileContentURL =
              editingNotification.FileContentURL || "";
            requestData.FileContent = editingNotification.FileContent || "";
          }
        }

        const response = await agent.post(SaveNotification, requestData);

        if (response.status === 200 && response.data.Status === "Success") {
          setSaveSuccess(true);
          resetForm();
          // Refresh with current filter
          const categoryIdForAPI =
            selectedNotificationCategory === "-1"
              ? -1
              : parseInt(selectedNotificationCategory, 10);
          fetchNotifications(categoryIdForAPI);

          setTimeout(() => {
            setSaveSuccess(false);
          }, 3000);
        } else {
          throw new Error(response.data.Message || "Save failed");
        }
      } catch (error) {
        console.error("Error saving notification:", error);
        setErrors({ form: "Failed to save notification. Please try again." });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const resetForm = () => {
    setCategory("");
    setTitleEnglish("");
    setTitleMarathi("");
    setStartDateTime("");
    setEndDateTime("");
    setPublishDateTime("");
    setDisplayNewImage("");
    setIsActive("");
    setContentType("");
    setUploadFile(null);
    setTextContent("");
    setTextContentMarathi("");
    setEditingNotification(null);
    setErrors({});
  };

  const handleEdit = (notification) => {
    setEditingNotification(notification);
    setCategory(notification.NotificationCategoryID?.toString() || "");
    setTitleEnglish(notification.NotificationTitle || "");
    setTitleMarathi(notification.NotificationTitleMarathi || "");

    // Format datetime-local values
    const formatDateTime = (dateTimeString) => {
      if (!dateTimeString) return "";
      const date = new Date(dateTimeString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    setStartDateTime(formatDateTime(notification.DisplayStartDateTime));
    setEndDateTime(formatDateTime(notification.DisplayEndDateTime));
    setPublishDateTime(formatDateTime(notification.PublishDateTime));

    setDisplayNewImage(notification.DisplayNewImage ? "Yes" : "No");
    setIsActive(notification.IsActive ? "Yes" : "No");

    // Map content type codes to dropdown values
    let contentTypeValue = "Text";
    if (notification.ContentType === "D") contentTypeValue = "File";
    else if (notification.ContentType === "H") contentTypeValue = "Hyperlink";

    setContentType(contentTypeValue);
    setTextContent(notification.TextContent || "");
    setTextContentMarathi(notification.TextContentMarathi || "");

    // Handle existing file for editing
    if (notification.ContentType === "D" && notification.FileContentURL) {
      setUploadFile({
        filePath: notification.FileContentURL,
        fileName: notification.FileContentName,
        uniqueFileName: notification.FileContentName,
        file: null,
      });
    } else {
      setUploadFile(null);
    }
  };

  const handleDelete = async (notificationId) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      try {
        const response = await agent.delete(DeleteNotification, {
          params: {
            NotificationID: notificationId,
            UserLoginID: userLoginID,
            IPAddress: ipAddress,
          },
        });

        if (response.status === 200) {
          const categoryIdForAPI =
            selectedNotificationCategory === "-1"
              ? -1
              : parseInt(selectedNotificationCategory, 10);
          fetchNotifications(categoryIdForAPI);
        }
      } catch (error) {
        console.error("Error deleting notification:", error);
      }
    }
  };

  // ---- FilteredTableComponent setup ----
  const notificationColumns = [
    {
      key: "Action",
      header: "Action",
      sortable: false,
      excludeFromExport: true,
      headerClassName: "text-center",
      width: "100px",
    },
    {
      key: "PublishDateTimeF",
      header: "Publish Date",
      width: "150px",
    },
    {
      key: "NotificationCategory",
      header: "Category",
      width: "180px",
    },
    {
      key: "NotificationTitle",
      header: "Title",
    },
  ];

  const renderNotificationCell = (item, column) => {
    if (column.key === "Action") {
      return (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleEdit(item)}
            className="text-blue-600 hover:text-blue-800 bg-blue-100 hover:bg-blue-200 p-1 rounded transition-colors"
            title="Edit"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(item.NotificationID)}
            className="text-red-600 hover:text-red-800 bg-red-100 hover:bg-red-200 p-1 rounded transition-colors"
            title="Delete"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      );
    }

    if (column.key === "NotificationTitle") {
      return (
        <div className="max-w-xs truncate" title={item.NotificationTitle}>
          {item.NotificationTitle}
        </div>
      );
    }

    return undefined; // fall through to default rendering
  };

  return (
    <div className="mx-auto w-full rounded-lg bg-white p-6 shadow-md">
      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <span className="font-bold">Success!</span> Notification{" "}
          {editingNotification ? "updated" : "saved"} successfully.
        </div>
      )}

      {/* Error Message */}
      {errors.form && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errors.form}
        </div>
      )}

      {/* Manage Notifications Section */}
      <fieldset className="mb-6 rounded-md border p-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-400 ${color} px-4 py-2 text-lg font-semibold text-white`}
        >
          {editingNotification ? "Edit Notification" : "Manage Notifications"}
        </legend>

        <form onSubmit={handleSubmit}>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <DropdownComponent
                label="Category"
                name="category"
                options={categories.filter((cat) => cat.value !== "-1")}
                value={category}
                onChange={(value) => handleDropdownChange("category", value)}
                error={errors.category}
                required={true}
                loading={loading.categories}
              />
            </div>

            {/* Title (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titleEnglish}
                onChange={(e) => setTitleEnglish(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.titleEnglish ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.titleEnglish && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.titleEnglish}
                </p>
              )}
            </div>

            {/* Title (Marathi) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (Marathi) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={titleMarathi}
                onChange={(e) => setTitleMarathi(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.titleMarathi ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.titleMarathi && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.titleMarathi}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {/* Start Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={startDateTime}
                onChange={(e) => setStartDateTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDateTime ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.startDateTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.startDateTime}
                </p>
              )}
            </div>

            {/* End Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={endDateTime}
                onChange={(e) => setEndDateTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDateTime ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.endDateTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.endDateTime}
                </p>
              )}
            </div>

            {/* Publish Date & Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Publish Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={publishDateTime}
                onChange={(e) => setPublishDateTime(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.publishDateTime ? "border-red-500" : "border-gray-300"}`}
              />
              {errors.publishDateTime && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.publishDateTime}
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {/* Display New Image */}
            <div>
              <DropdownComponent
                label="Display New Image"
                name="displayNewImage"
                options={yesNoOptions}
                value={displayNewImage}
                onChange={(value) =>
                  handleDropdownChange("displayNewImage", value)
                }
                error={errors.displayNewImage}
                required={true}
              />
            </div>

            {/* Is Active */}
            <div>
              <DropdownComponent
                label="Is Active"
                name="isActive"
                options={yesNoOptions}
                value={isActive}
                onChange={(value) => handleDropdownChange("isActive", value)}
                error={errors.isActive}
                required={true}
              />
            </div>

            {/* Content Type */}
            <div>
              <DropdownComponent
                label="Content Type"
                name="contentType"
                options={contentTypeOptions}
                value={contentType}
                onChange={(value) => handleDropdownChange("contentType", value)}
                error={errors.contentType}
                required={true}
              />
            </div>
          </div>

          {/* Conditional Content Based on Content Type */}
          {contentType === "File" && (
            <div className="mt-4">
              <UploadPdf
                file={uploadFile?.fileName || ""}
                onFileChange={handleFileChange}
                buttonClassName="bg-[#00c3f9]"
                buttonText="Upload File"
                label="Upload File"
                showLabel={true}
                allowedFileTypes="pdf, doc, docx, jpg, jpeg, png"
                maxFileSize="5 MB"
                required={!editingNotification}
                userTypeId={userInfo?.UserTypeID || 1}
                userLoginID={userInfo?.UserLoginID}
                linkName="View File"
                uniquefilepath={uploadFile?.filePath || ""}
                id="fileUpload"
              />
              {errors.uploadFile && (
                <p className="text-red-500 text-sm mt-1">{errors.uploadFile}</p>
              )}
            </div>
          )}

          {(contentType === "Text" || contentType === "Hyperlink") && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {contentType === "Hyperlink"
                    ? "URL (English)"
                    : "Text Content (English)"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows="4"
                  placeholder={
                    contentType === "Hyperlink"
                      ? "https://example.com"
                      : "Enter text content"
                  }
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.textContent ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.textContent && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.textContent}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {contentType === "Hyperlink"
                    ? "URL (Marathi)"
                    : "Text Content (Marathi)"}
                </label>
                <textarea
                  value={textContentMarathi}
                  onChange={(e) => setTextContentMarathi(e.target.value)}
                  rows="4"
                  placeholder={
                    contentType === "Hyperlink"
                      ? "https://example.com"
                      : "मराठी मजकूर प्रविष्ट करा"
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-center gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:opacity-90 text-white font-medium py-2 px-8 rounded-md disabled:bg-gray-400 transition-colors"
            >
              {isLoading
                ? editingNotification
                  ? "Updating..."
                  : "Saving..."
                : editingNotification
                  ? "Update"
                  : "Save"}
            </button>
            {editingNotification && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-8 rounded-md transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </fieldset>

      {/* Notifications List Section */}
      <fieldset className="mb-6 rounded-md border p-4">
        <legend
          className={`flex items-center gap-2 rounded-md border border-gray-400 ${color} px-4 py-2 text-lg font-semibold text-white`}
        >
          Notifications List
        </legend>

        {/* Category Filter (server-side) */}
        <div className="mt-4 mb-4 flex justify-center">
          <div className="w-1/3">
            <DropdownComponent
              label="Filter by Category"
              name="filterCategory"
              options={[
                { value: "-1", label: "All Categories" },
                ...categories.filter((cat) => cat.value !== "-1"),
              ]}
              value={selectedNotificationCategory}
              onChange={(value) =>
                handleDropdownChange("filterCategory", value)
              }
              loading={loading.categories}
            />
          </div>
        </div>

        {/* Filtered Table */}
        <FilteredTableComponent
          data={filteredNotifications}
          columns={notificationColumns}
          loading={loading.notifications}
          renderCell={renderNotificationCell}
          searchable={true}
          sortable={true}
          exportable={true}
          showExcelTemplate={false}
          exportFileName="notifications_export"
          tableId="notifications-table"
          maxHeight="384px"
          stickyHeader={true}
          emptyStateMessage="No notifications found"
          emptyStateSubMessage=""
          paginate={true}
          rowsPerPageOptions={[10, 20, 50, 100]}
          defaultRowsPerPage={20}
        />

        {/* Clear category filter shortcut */}
        {selectedNotificationCategory &&
          selectedNotificationCategory !== "-1" && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleCategoryFilter("-1")}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Clear category filter
              </button>
            </div>
          )}
      </fieldset>
    </div>
  );
};

export default ManageNotifications;
