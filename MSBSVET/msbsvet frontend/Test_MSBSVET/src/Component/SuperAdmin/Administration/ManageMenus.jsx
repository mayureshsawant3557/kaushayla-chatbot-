import React, { useState, useEffect, useCallback, useMemo } from "react";
import agent from '../../../lib/api/agent';
import { X, Loader2, Edit, Plus, RotateCcw, Save } from "lucide-react";
import Swal from "sweetalert2";
import DropdownComponent from "../../formcomponent/DropdownComponent";
import FormComponent from "../../formcomponent/FormComponent";

import { baseURL } from "../../../Endpoints_All/config/baseConfig";

import { getDeviceIP } from "../../../utils/CommonHelper";
import { useAuth } from "../../../Hooks/AuthContext";

// Constants
const API_CONFIG = {
    BASE_URL: baseURL,
    ENDPOINTS: {
        MASTER_TABLE: "/Base/GetMasterTableList",
        GROUPS_LIST: "/api/Menu/GetGroupsList",
        MENUS_LIST: "/api/Menu/GetMenusList",
        SAVE_MENU: "/api/Menu/SaveMenuDetails"
    }
};

const INITIAL_FORM_DATA = {
    userType: "",
    group: "",
};

const INITIAL_MENU_FORM_DATA = {
    linkId: "",
    displayStartDateTime: "",
    displayEndDateTime: "",
    openInNewWindow: "No",
    displayNewImage: "No",
    isActive: "Yes",
    cssClass: "",
    groupName: "",
    seqNo: "",
};

const VALIDATION_RULES = {
    linkId: { required: true, message: "Link is required" },
    displayStartDateTime: { required: true, message: "Start date is required" },
    displayEndDateTime: { required: true, message: "End date is required" },
};

const ManageMenus = () => {
    // State management
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [userTypes, setUserTypes] = useState([]);
    const [groups, setGroups] = useState([]);
    const [menus, setMenus] = useState([]);
    const [availableLinks, setAvailableLinks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [errors, setErrors] = useState({});
    const [menuFormData, setMenuFormData] = useState(INITIAL_MENU_FORM_DATA);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [ipAddress, setIpAddress] = useState("");
    const [loading, setLoading] = useState({
        userTypes: false,
        groups: false,
        menus: false,
        links: false,
        saving: false
    });
     const {userInfo} = useAuth();

    // Memoized options for dropdowns
    const userTypeOptions = useMemo(() =>
        userTypes.map(userType => ({
            label: userType.Text,
            value: userType.Value
        })),
        [userTypes]
    );

     const fetchIP = async () => {
        try {
            const ip = await getDeviceIP();
            setIpAddress(ip);
        } catch (err) {
            console.error("Failed to get IP:", err);
        }
        };

    const groupOptions = useMemo(() =>
        groups.map(group => ({
            label: group.LinkName,
            value: group.MenuID
        })),
        [groups]
    );

    const linkOptions = useMemo(() =>
        availableLinks.map(link => ({
            label: link.LinkName,
            value: link.LinkID
        })),
        [availableLinks]
    );

    const yesNoOptions = useMemo(() => [
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
    ], []);

    // API Functions
    const fetchUserTypes = useCallback(async () => {
        setLoading(prev => ({ ...prev, userTypes: true }));
        try {
            const response = await agent.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MASTER_TABLE}`, {
                params: {
                    TableName: "Master_UserType",
                    DataValueField: "UserTypeID",
                    DataTextField: "UserType",
                    HasSelect: true,
                    orderByText: "UserTypeID"
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setUserTypes(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch user types");
            }
        } catch (error) {
            console.error("Error fetching user types:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load user types. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, userTypes: false }));
        }
    }, []);

    const fetchGroups = useCallback(async (userTypeId) => {
        if (!userTypeId || userTypeId === "-1") return;

        setLoading(prev => ({ ...prev, groups: true }));
        try {
            const response = await agent.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GROUPS_LIST}`, {
                params: {
                    RegionID: 1,
                    UserTypeID: userTypeId
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setGroups(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch groups");
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load groups. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, groups: false }));
        }
    }, []);

    const fetchMenus = useCallback(async (userTypeId, parentMenuId) => {
        if (!userTypeId || !parentMenuId || userTypeId === "-1") return;

        setLoading(prev => ({ ...prev, menus: true }));
        try {
            const response = await agent.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENUS_LIST}`, {
                params: {
                    RegionID: 1,
                    UserTypeID: userTypeId,
                    ParentMenuID: parentMenuId
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setMenus(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch menus");
            }
        } catch (error) {
            console.error("Error fetching menus:", error);
            await Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load menus. Please try again.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, menus: false }));
        }
    }, []);

    const fetchAvailableLinks = useCallback(async () => {
        if (!formData.userType || !formData.group) return;

        setLoading(prev => ({ ...prev, links: true }));
        try {
            const response = await agent.get(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MENUS_LIST}`, {
                params: {
                    RegionID: 1,
                    UserTypeID: formData.userType,
                    ParentMenuID: formData.group
                },
                timeout: 10000
            });

            if (response.data.Status === "Success") {
                setAvailableLinks(response.data.Data || []);
            } else {
                throw new Error(response.data.Message || "Failed to fetch links");
            }
        } catch (error) {
            console.error("Error fetching available links:", error);
        } finally {
            setLoading(prev => ({ ...prev, links: false }));
        }
    }, [formData.userType, formData.group]);

    // Effects
    useEffect(() => {
        fetchUserTypes();
        fetchIP();
    }, [fetchUserTypes]);

    useEffect(() => {
        if (showModal && formData.userType && formData.group) {
            fetchAvailableLinks();
        }
    }, [showModal, fetchAvailableLinks, formData.userType, formData.group]);

    // Validation
    const validateForm = useCallback(() => {
        const validationErrors = {};

        Object.entries(VALIDATION_RULES).forEach(([field, rule]) => {
            if (rule.required && !menuFormData[field]?.toString().trim()) {
                validationErrors[field] = rule.message;
            }
        });

        // Date validation
        if (menuFormData.displayStartDateTime && menuFormData.displayEndDateTime) {
            const startDate = new Date(menuFormData.displayStartDateTime);
            const endDate = new Date(menuFormData.displayEndDateTime);

            if (endDate <= startDate) {
                validationErrors.displayEndDateTime = "End date must be after start date";
            }
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }, [menuFormData]);

    // Event Handlers
    const handleChange = useCallback((name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));

        // Reset dependent fields
        if (name === 'userType') {
            setFormData(prev => ({ ...prev, group: "" }));
            setGroups([]);
            setMenus([]);

            if (value && value !== "-1") {
                fetchGroups(value);
            }
        } else if (name === 'group') {
            setMenus([]);
            if (value && formData.userType) {
                fetchMenus(formData.userType, value);
            }
        }
    }, [formData.userType, fetchGroups, fetchMenus]);

    const handleMenuFormChange = useCallback((name, value) => {
        setMenuFormData(prev => ({ ...prev, [name]: value }));

        // Clear error for the field being edited
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }

        // Real-time validation if submit was attempted
        if (submitAttempted && VALIDATION_RULES[name]?.required) {
            setErrors(prev => ({
                ...prev,
                [name]: value?.toString().trim() ? undefined : VALIDATION_RULES[name].message
            }));
        }
    }, [errors, submitAttempted]);

    const handleMenuUpdate = useCallback((menuId, field, value) => {
        setMenus(prev =>
            prev.map(menu => {
                if (menu.MenuID === menuId) {
                    if (field === "SeqNo") {
                        // Handle sequence number - convert to integer or 0 if empty
                        const seqValue = value && value.toString().trim() !== "" ? parseInt(value) : 0;
                        return { ...menu, [field]: seqValue };
                    }
                    return { ...menu, [field]: value };
                }
                return menu;
            })
        );
    }, []);


    const handleAddNewMenu = useCallback(() => {
        setEditingMenu(null);
        setMenuFormData(INITIAL_MENU_FORM_DATA);
        setErrors({});
        setSubmitAttempted(false);
        setShowModal(true);
    }, []);

    const handleEditMenu = useCallback((menu) => {
        setEditingMenu(menu);
        const startDate = new Date(menu.DisplayStartDateTime);
        const endDate = new Date(menu.DisplayEndDateTime);

        setMenuFormData({
            linkId: menu.LinkID?.toString() || "",
            displayStartDateTime: startDate.toISOString().slice(0, 16),
            displayEndDateTime: endDate.toISOString().slice(0, 16),
            openInNewWindow: menu.Target === "_blank" ? "Yes" : "No",
            displayNewImage: menu.IsNew ? "Yes" : "No",
            isActive: menu.IsActive ? "Yes" : "No",
            cssClass: menu.CSSClass || "",
            groupName: menu.GroupName || "",
            seqNo: menu.SeqNo?.toString() || "",
        });
        setErrors({});
        setSubmitAttempted(false);
        setShowModal(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setShowModal(false);
        setMenuFormData(INITIAL_MENU_FORM_DATA);
        setErrors({});
        setSubmitAttempted(false);
    }, []);

    const saveMenu = useCallback(async (payload) => {
        try {
            const response = await agent.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SAVE_MENU}`,
                payload,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );
            if (response.data?.Status === "Success") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.Message || 'Menu details saved successfully.',
                    confirmButtonColor: '#10b981'
                });
                return true;
            } else {
                throw new Error(response.data?.Message || "Failed to save menu details");
            }
        } catch (error) {
            console.error("API Error:", error);

            let errorMessage = "Something went wrong while saving the menu.";

            if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please try again.";
            } else if (error.response?.status === 404) {
                errorMessage = "API endpoint not found.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (error.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });

            return false;
        }
    }, []);

    const handleSubmit = useCallback(async () => {
        setSubmitAttempted(true);

        if (!validateForm()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill in all required fields correctly.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setLoading(prev => ({ ...prev, saving: true }));

        try {
            const payload = {
                MenuID: editingMenu ? editingMenu.MenuID : 0,
                UserTypeID: parseInt(formData.userType),
                ParentMenuID: parseInt(formData.group),
                LinkID: parseInt(menuFormData.linkId),
                DisplayStartDateTime: menuFormData.displayStartDateTime,
                DisplayEndDateTime: menuFormData.displayEndDateTime,
                CSSClass: menuFormData.cssClass || "",
                GroupName: menuFormData.groupName || "",
                Target: menuFormData.openInNewWindow === "Yes" ? "_blank" : "",
                SeqNo: parseInt(menuFormData.seqNo) || 0,
                IsNew: menuFormData.displayNewImage === "Yes" ? 1 : 0,
                IsActive: menuFormData.isActive === "Yes" ? 1 : 0,
                RegionID: 1,
                UserLoginID: userInfo?.UserLoginID, // Replace with actual user ID
                IPAddress: ipAddress // Get actual IP if needed
            };

            const success = await saveMenu(payload);

            if (success) {
                handleCloseModal();
                // Refresh menus list
                await fetchMenus(formData.userType, formData.group);
            }
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    }, [menuFormData, formData, editingMenu, validateForm, saveMenu, handleCloseModal, fetchMenus]);

    const handleResetMenus = useCallback(() => {
        setMenus([]);
        setFormData(INITIAL_FORM_DATA);
        setGroups([]);
    }, []);

    const handleSaveMenus = useCallback(async () => {
        if (menus.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'No Menus',
                text: 'No menus available to save.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Show confirmation dialog
        const result = await Swal.fire({
            title: 'Save Menu Changes',
            text: 'Are you sure you want to save all menu changes (active status and sequence)?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Save Changes',
            cancelButtonText: 'Cancel'
        });

        if (!result.isConfirmed) return;

        setLoading(prev => ({ ...prev, saving: true }));

        try {
            // Build array of menu entities with all required fields
            const menuEntities = menus.map(menu => ({
                MenuID: menu.MenuID,
                UserTypeID: parseInt(formData.userType),
                ParentMenuID: parseInt(formData.group),
                LinkID: menu.LinkID || 0,
                DisplayStartDateTime: menu.DisplayStartDateTime || new Date().toISOString(),
                DisplayEndDateTime: menu.DisplayEndDateTime || new Date().toISOString(),
                CSSClass: menu.CSSClass || "",
                GroupName: menu.GroupName || groups.find(g => g.MenuID.toString() === formData.group)?.LinkName || "",
                Target: menu.Target || "",
                SeqNo: parseInt(menu.SeqNo) || 0,
                IsNew: menu.IsNew ? 1 : 0,
                IsActive: menu.IsActive ? 1 : 0,
                RegionID: 1,
                UserLoginID: userInfo?.UserLoginID, // Replace with actual logged-in user ID from context/session
                IPAddress: ipAddress // You can get actual IP if needed
            }));


            const response = await agent.post(
                `${API_CONFIG.BASE_URL}/api/Menu/SaveMenusActiveStatus`,
                menuEntities,
                {
                    // headers: {
                    //     'Content-Type': 'application/json',
                    //     // Add authorization header if needed
                    //     // 'Authorization': `Bearer ${token}`
                    // },
                    timeout: 15000
                }
            );

            if (response.data?.Status === "Success" && response.data?.Data === "Y") {
                await Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: response.data.Message || 'Menus active status updated successfully.',
                    confirmButtonColor: '#10b981',
                    timer: 2000,
                    timerProgressBar: true
                });

                // Refresh menus list to show updated data
                await fetchMenus(formData.userType, formData.group);

                // Optional: If you have global menu state management, refresh it here
                // This is equivalent to the Global.PublicMenu refresh in C# code
                // dispatch(refreshGlobalMenus());

            } else {
                throw new Error(response.data?.Message || "Failed to save menus active status");
            }

        } catch (error) {
            console.error("Error saving menus:", error);

            let errorMessage = "Something went wrong while saving menu changes.";

            if (error.code === 'ECONNABORTED') {
                errorMessage = "Request timeout. Please try again.";
            } else if (error.response?.status === 404) {
                errorMessage = "API endpoint not found.";
            } else if (error.response?.status >= 500) {
                errorMessage = "Server error. Please try again later.";
            } else if (error.response?.data?.Message) {
                errorMessage = error.response.data.Message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Save Failed!',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(prev => ({ ...prev, saving: false }));
        }
    }, [menus, formData.userType, formData.group, groups, fetchMenus]);



    // Utility functions
    const formatDateTime = useCallback((dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }, []);

    return (
        <div className="mt-6 p-4">
            {/* Form Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
                <DropdownComponent
                    label="User Type"
                    options={userTypeOptions}
                    value={formData.userType}
                    onChange={(value) => handleChange("userType", value)}
                    error={errors.userType}
                    required
                    loading={loading.userTypes}
                    placeholder="Select User Type"
                />

                <DropdownComponent
                    label="Group"
                    options={groupOptions}
                    value={formData.group}
                    onChange={(value) => handleChange("group", value)}
                    error={errors.group}
                    required
                    loading={loading.groups}
                    disabled={!formData.userType || formData.userType === "-1"}
                    placeholder="Select Group"
                />

                <div className="lg:col-span-2 flex items-end">
                    <button
                        onClick={handleAddNewMenu}
                        disabled={!formData.group}
                        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-3 w-3" />
                        Add New Menu
                    </button>
                </div>


            </div>

            {/* Loading indicator */}
            {loading.menus && (
                <div className="text-center py-8">
                    <Loader2 className="inline-block animate-spin h-6 w-6 text-blue-600" />
                    <span className="ml-2">Loading menus...</span>
                </div>
            )}

            {/* Menu Table */}
            {menus.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Action
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Menu Name
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Display Start Date Time
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-700">
                                    Display End Date Time
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    Is Active
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    Set Seq
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-700">
                                    Seq No
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {menus.map((menu) => (
                                <tr
                                    key={menu.MenuID}
                                    className={menu.IsActive ? "bg-green-50" : "bg-white hover:bg-gray-50"}
                                >
                                    <td className="border border-gray-300 px-4 py-3">
                                        <button
                                            onClick={() => handleEditMenu(menu)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                            title="Edit menu"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {menu.LinkName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {formatDateTime(menu.DisplayStartDateTime)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-sm text-gray-700">
                                        {formatDateTime(menu.DisplayEndDateTime)}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <input
                                            type="checkbox"
                                            checked={menu.IsActive}
                                            onChange={(e) =>
                                                handleMenuUpdate(menu.MenuID, "IsActive", e.target.checked)
                                            }
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </td>
                                    {/* Replace the SeqNo column in the table body */}
                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <input
                                            type="number"
                                            min="0"
                                            max="999"
                                            value={menu.SeqNo || ""}
                                            onChange={(e) => handleMenuUpdate(menu.MenuID, "SeqNo", e.target.value)}
                                            className="w-20 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="0"
                                        />
                                    </td>

                                    <td className="border border-gray-300 px-4 py-3 text-center">
                                        <span className="text-lg font-bold">{menu.SeqNo || ""}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for Add/Edit Menu */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingMenu ? "Edit Menu" : "Add New Menu"}
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                disabled={loading.saving}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Link Selection */}
                            <DropdownComponent
                                label="Link"
                                options={linkOptions}
                                value={menuFormData.linkId}
                                onChange={(value) => handleMenuFormChange("linkId", value)}
                                error={errors.linkId}
                                required
                                loading={loading.links}
                                placeholder="Select a link"
                            />

                            {/* Date Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <FormComponent
                                    label="Start Date"
                                    type="datetime-local"
                                    value={menuFormData.displayStartDateTime}
                                    onChange={(value) => handleMenuFormChange("displayStartDateTime", value)}
                                    error={errors.displayStartDateTime}
                                    required
                                />
                                <FormComponent
                                    label="End Date"
                                    type="datetime-local"
                                    value={menuFormData.displayEndDateTime}
                                    onChange={(value) => handleMenuFormChange("displayEndDateTime", value)}
                                    error={errors.displayEndDateTime}
                                    required
                                />
                            </div>

                            {/* Additional Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <DropdownComponent
                                    label="Open in New Window"
                                    options={yesNoOptions}
                                    value={menuFormData.openInNewWindow}
                                    onChange={(value) => handleMenuFormChange("openInNewWindow", value)}
                                    required
                                />
                                <DropdownComponent
                                    label="Display New Image"
                                    options={yesNoOptions}
                                    value={menuFormData.displayNewImage}
                                    onChange={(value) => handleMenuFormChange("displayNewImage", value)}
                                    required
                                />
                                <DropdownComponent
                                    label="Is Active"
                                    options={yesNoOptions}
                                    value={menuFormData.isActive}
                                    onChange={(value) => handleMenuFormChange("isActive", value)}
                                    required
                                />
                            </div>

                            {/* Optional Fields */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <FormComponent
                                    label="CSS Class"
                                    value={menuFormData.cssClass}
                                    onChange={(value) => handleMenuFormChange("cssClass", value)}
                                    placeholder="Enter CSS class"
                                />
                                <FormComponent
                                    label="Group Name"
                                    value={menuFormData.groupName}
                                    onChange={(value) => handleMenuFormChange("groupName", value)}
                                    placeholder="Enter group name"
                                />
                                <FormComponent
                                    label="Sequence Number"
                                    type="number"
                                    value={menuFormData.seqNo}
                                    onChange={(value) => handleMenuFormChange("seqNo", value)}
                                    placeholder="Enter sequence number"
                                />
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={handleCloseModal}
                                disabled={loading.saving}
                                className="order-2 sm:order-1 px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading.saving}
                                className="order-1 sm:order-2 flex items-center justify-center gap-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.saving && <Loader2 className="h-4 w-4 animate-spin" />}
                                {loading.saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                <button
                    onClick={handleResetMenus}
                    className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200"
                >
                    <RotateCcw className="h-4 w-4" />
                    Reset Menus
                </button>
                <button
                    onClick={handleSaveMenus}
                    disabled={menus.length === 0 || loading.saving}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-md transition-colors duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
                >
                    {loading.saving ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            Save Menu Changes
                        </>
                    )}
                </button>

            </div>
        </div>
    );
};

export default ManageMenus;
